import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Search, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { supabase, type Booking } from "../../../lib/supabase";

export function PaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, rooms(name, type, price)")
      .order("created_at", { ascending: false });

    if (!error && data) setBookings(data as Booking[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      setSelectedBooking(prev => prev?.id === id ? { ...prev, status } : prev);
    }
    setUpdating(false);
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchSearch =
      b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guest_phone.includes(searchTerm) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    pending: bookings.filter(b => b.status === "pending").length,
    approved: bookings.filter(b => b.status === "approved").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

  const nights = (b: Booking) => {
    const diff = new Date(b.check_out).getTime() - new Date(b.check_in).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Verification</h1>
          <p className="text-gray-500 text-sm">Review guest bookings and approve or reject payments.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{counts.pending}</p>
          <p className="text-xs text-orange-700 font-medium mt-1">Pending</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
          <p className="text-xs text-green-700 font-medium mt-1">Approved</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
          <p className="text-xs text-red-700 font-medium mt-1">Rejected</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or booking ID..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {["all", "pending", "approved", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filterStatus === s ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-medium">
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(booking => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 text-sm">{booking.guest_name}</p>
                    <p className="text-xs text-gray-400">{booking.guest_phone}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {booking.rooms?.name ?? `Room #${booking.room_id}`}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    <p>{formatDate(booking.check_in)}</p>
                    <p>→ {formatDate(booking.check_out)}</p>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900 text-sm">
                    ₱{Number(booking.total_amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      booking.status === "approved" ? "bg-green-100 text-green-700" :
                      booking.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {booking.status === "approved" && <CheckCircle className="w-3 h-3" />}
                      {booking.status === "rejected" && <XCircle className="w-3 h-3" />}
                      {booking.status === "pending" && <Clock className="w-3 h-3" />}
                      <span className="capitalize">{booking.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedBooking(booking); }}
                      className="text-sm font-medium text-orange-500 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p>No bookings found.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Payment Proof */}
            <div className="md:w-1/2 bg-gray-100 p-6 flex items-center justify-center relative min-h-48">
              {selectedBooking.payment_proof_url ? (
                <>
                  <img
                    src={selectedBooking.payment_proof_url}
                    alt="Proof of Payment"
                    className="max-w-full max-h-72 object-contain shadow-lg rounded-lg"
                  />
                  <a
                    href={selectedBooking.payment_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-lg hover:bg-white text-gray-600 hover:text-black transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              ) : (
                <p className="text-gray-400 text-sm">No payment proof uploaded</p>
              )}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">Booking Details</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">#{selectedBooking.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-black">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3 text-sm flex-1">
                <Row label="Guest" value={selectedBooking.guest_name} />
                <Row label="Phone" value={selectedBooking.guest_phone} />
                {selectedBooking.guest_email && <Row label="Email" value={selectedBooking.guest_email} />}
                <Row label="Room" value={selectedBooking.rooms?.name ?? `Room #${selectedBooking.room_id}`} />
                <Row label="Check-in" value={formatDate(selectedBooking.check_in)} />
                <Row label="Check-out" value={formatDate(selectedBooking.check_out)} />
                <Row label="Nights" value={String(nights(selectedBooking))} />
                <Row label="Guests" value={String(selectedBooking.guests)} />
                <Row label="Total" value={`₱${Number(selectedBooking.total_amount).toLocaleString()}`} bold />
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <span className={`capitalize font-bold ${
                    selectedBooking.status === "approved" ? "text-green-600" :
                    selectedBooking.status === "rejected" ? "text-red-600" :
                    "text-orange-600"
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <Row label="Submitted" value={formatDate(selectedBooking.created_at)} />
              </div>

              {selectedBooking.status === "pending" && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => updateStatus(selectedBooking.id, "rejected")}
                    disabled={updating}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus(selectedBooking.id, "approved")}
                    disabled={updating}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 shadow-lg shadow-green-200"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                </div>
              )}

              {selectedBooking.status !== "pending" && (
                <div className={`mt-6 text-center py-3 rounded-xl font-bold text-sm ${
                  selectedBooking.status === "approved"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {selectedBooking.status === "approved" ? "✓ Payment Approved" : "✗ Payment Rejected"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? "font-bold text-lg" : "font-medium text-right"}>{value}</span>
    </div>
  );
}
