import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Tag, AlertTriangle, X, Check, ImageIcon, Upload } from "lucide-react";
import { supabase, type Room } from "../../../lib/supabase";

const ROOM_TYPES = ["Single", "Standard", "Family", "Barkada"];
const DISCOUNT_OPTIONS = [10, 20, 30] as const;
type DiscountPercent = (typeof DISCOUNT_OPTIONS)[number];

const emptyForm = {
  name: "",
  type: "Standard",
  price: "",
  capacity: "",
  floor: "",
  bed_type: "",
  description: "",
  image_url: "",
  amenities: "",
};

export function SettingsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [discountActive, setDiscountActive] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<DiscountPercent>(10);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [discountSaved, setDiscountSaved] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [photoModalRoom, setPhotoModalRoom] = useState<Room | null>(null);
  const [photoTab, setPhotoTab] = useState<"upload" | "url">("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
    fetchDiscount();
  }, []);

  async function fetchRooms() {
    setLoading(true);
    const { data, error } = await supabase.from("rooms").select("*").order("id");
    if (error) setFetchError(error.message);
    else setRooms(data || []);
    setLoading(false);
  }

  async function fetchDiscount() {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "discount")
      .maybeSingle();
    if (data?.value && typeof data.value === "object") {
      setDiscountActive(Boolean(data.value.active));
      setDiscountPercent((data.value.percent as DiscountPercent) || 10);
    }
  }

  async function handleSaveDiscount() {
    setDiscountError(null);
    setSavingDiscount(true);
    const { error } = await supabase
      .from("settings")
      .upsert(
        { key: "discount", value: { active: discountActive, percent: discountPercent } },
        { onConflict: "key" }
      );
    setSavingDiscount(false);
    if (error) {
      setDiscountError(error.message);
    } else {
      setDiscountSaved(true);
      setTimeout(() => setDiscountSaved(false), 2500);
    }
  }

  function openAdd() {
    setEditingRoom(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(room: Room) {
    setEditingRoom(room);
    setForm({
      name: room.name,
      type: room.type,
      price: String(room.price),
      capacity: String(room.capacity),
      floor: room.floor || "",
      bed_type: room.bed_type || "",
      description: room.description || "",
      image_url: room.image_url || "",
      amenities: room.amenities ? room.amenities.join(", ") : "",
    });
    setFormError(null);
    setShowModal(true);
  }

  async function handleSaveRoom(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.capacity) {
      setFormError("Name, price, and capacity are required.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      type: form.type,
      price: Number(form.price),
      capacity: Number(form.capacity),
      floor: form.floor.trim() || null,
      bed_type: form.bed_type.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      amenities: form.amenities
        ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean)
        : null,
      available: editingRoom?.available ?? 1,
    };

    const { error } = editingRoom
      ? await supabase.from("rooms").update(payload).eq("id", editingRoom.id)
      : await supabase.from("rooms").insert(payload);

    setSaving(false);
    if (error) {
      setFormError(error.message);
    } else {
      setShowModal(false);
      fetchRooms();
    }
  }

  async function handleDeleteRoom() {
    if (deleteId === null) return;
    setDeleting(true);
    await supabase.from("rooms").delete().eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    fetchRooms();
  }

  function openPhotoModal(room: Room) {
    setPhotoModalRoom(room);
    setPhotoUrl(room.image_url || "");
    setPhotoFile(null);
    setPhotoPreview(room.image_url || "");
    setPhotoError(null);
    setPhotoTab("upload");
  }

  function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl("");
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSavePhoto() {
    if (!photoModalRoom) return;
    setPhotoSaving(true);
    setPhotoError(null);

    let finalUrl: string | null = null;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `room-${photoModalRoom.id}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("room-images")
        .upload(path, photoFile, { upsert: true });
      if (error) {
        setPhotoError(
          `Upload failed: ${error.message}. Make sure a "room-images" storage bucket exists in your Supabase project (Storage → New bucket → name: room-images, public: on).`
        );
        setPhotoSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("room-images").getPublicUrl(data.path);
      finalUrl = urlData.publicUrl;
    } else if (photoUrl.trim()) {
      finalUrl = photoUrl.trim();
    }

    const { error } = await supabase
      .from("rooms")
      .update({ image_url: finalUrl })
      .eq("id", photoModalRoom.id);

    setPhotoSaving(false);
    if (error) {
      setPhotoError(error.message);
    } else {
      setPhotoModalRoom(null);
      fetchRooms();
    }
  }

  async function handleRemovePhoto(room: Room) {
    await supabase.from("rooms").update({ image_url: null }).eq("id", room.id);
    fetchRooms();
  }

  const discountedPrice = (price: number) =>
    Math.round(price * (1 - discountPercent / 100));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage rooms and site-wide pricing</p>
      </div>

      {/* ── Discount Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-1">
          <Tag className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-900">Site-wide Discount</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          When enabled, all rooms display discounted prices to guests on the Rooms and Booking pages.
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Toggle — local state only until Save */}
          <button
            type="button"
            onClick={() => setDiscountActive((v) => !v)}
            className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
              discountActive ? "bg-orange-500" : "bg-gray-200"
            }`}
            aria-pressed={discountActive}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                discountActive ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>

          <span className={`text-sm font-semibold ${discountActive ? "text-orange-600" : "text-gray-500"}`}>
            {discountActive ? "Discount ON" : "Discount OFF"}
          </span>

          {discountActive && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Amount:</span>
              <select
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value) as DiscountPercent)}
                className="border border-orange-200 bg-orange-50 text-orange-700 font-bold rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none cursor-pointer"
              >
                {DISCOUNT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}% OFF
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {discountActive && (
          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-800">
            Guests will see{" "}
            <strong className="font-bold">{discountPercent}% off</strong> on all room prices.{" "}
            Example: ₱1,000/night → <strong>₱{(1000 * (1 - discountPercent / 100)).toLocaleString()}</strong>/night.
          </div>
        )}

        {discountError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <p className="font-semibold mb-0.5">Supabase error:</p>
            <p className="font-mono text-xs break-all">{discountError}</p>
            <p className="mt-2 text-xs text-red-600">
              If this says "relation does not exist", run this SQL in your Supabase dashboard → SQL Editor:
            </p>
            <pre className="mt-1 bg-red-100 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">{`CREATE TABLE IF NOT EXISTS settings (\n  key TEXT PRIMARY KEY,\n  value JSONB NOT NULL DEFAULT '{}'::jsonb\n);\nINSERT INTO settings (key, value)\nVALUES ('discount', '{"active":false,"percent":10}'::jsonb)\nON CONFLICT (key) DO NOTHING;`}</pre>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDiscount}
            disabled={savingDiscount}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors disabled:opacity-60"
          >
            {savingDiscount ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              "Save"
            )}
          </button>
          {discountSaved && (
            <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
              <Check className="w-4 h-4" /> Saved successfully
            </span>
          )}
        </div>
      </div>

      {/* ── Rooms Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Rooms</h2>
            <p className="text-sm text-gray-400">
              {loading ? "Loading…" : `${rooms.length} room${rooms.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
          </div>
        ) : fetchError ? (
          <div className="py-10 text-center text-red-500 text-sm">{fetchError}</div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No rooms yet. Click <strong>Add Room</strong> to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Room", "Type", "Floor", "Bed", "Capacity", "Price / Night", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{room.name}</p>
                      {room.description && (
                        <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">
                          {room.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-orange-50 text-orange-700 border border-orange-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {room.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{room.floor || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{room.bed_type || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{room.capacity} pax</td>
                    <td className="px-5 py-4">
                      <p className={`font-bold ${discountActive ? "line-through text-gray-400 text-xs" : "text-gray-900"}`}>
                        ₱{Number(room.price).toLocaleString()}
                      </p>
                      {discountActive && (
                        <>
                          <p className="font-bold text-green-600">
                            ₱{discountedPrice(Number(room.price)).toLocaleString()}
                          </p>
                          <p className="text-xs text-orange-500 font-medium">-{discountPercent}% OFF</p>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(room)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                          title="Edit room"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(room.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Room Photos Section ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <ImageIcon className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">Room Photos</h2>
          </div>
          <p className="text-sm text-gray-400">Add, change, or remove photos for each room.</p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm px-6">
            No rooms yet. Add rooms above to manage their photos.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[4/3]"
              >
                {room.image_url ? (
                  <img
                    src={room.image_url}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs">No photo</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => openPhotoModal(room)}
                    className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {room.image_url ? "Change" : "Add Photo"}
                  </button>
                  {room.image_url && (
                    <button
                      onClick={() => handleRemovePhoto(room)}
                      className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <p className="text-white text-xs font-semibold truncate">{room.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Room Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold">
                {editingRoom ? `Edit — ${editingRoom.name}` : "Add New Room"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                  Room Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Room 101"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                    Price / Night (₱) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 1500"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                    Capacity (pax) *
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    placeholder="e.g. 4"
                    min="1"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                    Floor
                  </label>
                  <input
                    value={form.floor}
                    onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                    placeholder="e.g. 2nd Floor"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                    Bed Type
                  </label>
                  <input
                    value={form.bed_type}
                    onChange={(e) => setForm((f) => ({ ...f, bed_type: e.target.value }))}
                    placeholder="e.g. Queen Bed"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                  Amenities (comma-separated)
                </label>
                <input
                  value={form.amenities}
                  onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))}
                  placeholder="e.g. AC, WiFi, TV, Hot Shower"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief room description…"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                  Image URL
                </label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </>
                  ) : editingRoom ? (
                    "Save Changes"
                  ) : (
                    "Add Room"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Photo Edit Modal ── */}
      {photoModalRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold">Edit Photo — {photoModalRoom.name}</h3>
              <button
                onClick={() => setPhotoModalRoom(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    key={photoPreview}
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 gap-2">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs">No photo selected</span>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(["upload", "url"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPhotoTab(tab)}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                      photoTab === tab
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "upload" ? "Upload File" : "Use URL"}
                  </button>
                ))}
              </div>

              {photoTab === "upload" ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                    <Upload className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      {photoFile ? photoFile.name : "Click to upload an image"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WEBP — saved to Supabase Storage
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                    Image URL
                  </label>
                  <input
                    value={photoUrl}
                    onChange={(e) => {
                      setPhotoUrl(e.target.value);
                      setPhotoFile(null);
                      setPhotoPreview(e.target.value);
                    }}
                    placeholder="https://…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
              )}

              {photoError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg leading-relaxed">
                  {photoError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPhotoModalRoom(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={photoSaving || (!photoFile && !photoUrl.trim())}
                  className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {photoSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : (
                    "Save Photo"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Delete this room?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This is permanent and cannot be undone. Existing bookings for this room may be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}