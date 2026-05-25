import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import { Calendar, CreditCard, ChevronLeft, Upload, Check, Loader2, User, Phone, Mail, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { supabase, type Room, getDiscountSetting, type DiscountSetting } from "../../lib/supabase";

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get("room") || "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState("");

  const [discount, setDiscount] = useState<DiscountSetting>({ active: false, percent: 10 });

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guests: Number(searchParams.get("guests")) || 1,
    roomId: initialRoomId,
    paymentProof: null as File | null,
  });

  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, name, type, price, capacity")
        .gt("available", 0)
        .order("type")
        .order("name");
      if (!error && data) {
        setRooms(data as Room[]);
        if (!initialRoomId && data.length > 0) {
          setFormData(prev => ({ ...prev, roomId: String(data[0].id) }));
        }
      }
      setLoadingRooms(false);
    }
    fetchRooms();
  }, []);

  const selectedRoom = rooms.find(r => String(r.id) === formData.roomId) || rooms[0];

  const nights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 1;
    const diff = new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [formData.checkIn, formData.checkOut]);

  const baseAmount = selectedRoom ? Number(selectedRoom.price) * nights : 0;
  const discountAmount = discount.active ? Math.round(baseAmount * discount.percent / 100) : 0;
  const totalAmount = baseAmount - discountAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, paymentProof: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!formData.paymentProof || !selectedRoom) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Convert payment proof to base64
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(formData.paymentProof!);
      });

      // 2. Insert booking record
      const { data: booking, error: insertError } = await supabase
        .from("bookings")
        .insert({
          room_id: Number(formData.roomId),
          guest_name: formData.guestName,
          guest_email: formData.guestEmail || null,
          guest_phone: formData.guestPhone,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          guests: formData.guests,
          total_amount: totalAmount,
          payment_proof_url: base64Url,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      setConfirmedBookingId(booking.id.slice(0, 8).toUpperCase());
      setStep(2);
    } catch (err: any) {
      setSubmitError(err.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Booking Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you, <strong>{formData.guestName}</strong>! Your booking request has been received.
            Our admin will review your payment and confirm your reservation.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl mb-8 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono font-bold">#{confirmedBookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Room</span>
              <span className="font-bold">{selectedRoom?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in</span>
              <span className="font-bold">{formData.checkIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span className="font-bold">{formData.checkOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stay</span>
              <span className="font-bold">{nights} night{nights > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-bold text-green-600">₱{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-bold">PENDING REVIEW</span>
            </div>
          </div>
          <Link to="/" className="block w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-orange-500 transition-colors">
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/rooms" className="inline-flex items-center text-gray-500 hover:text-black mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Rooms
          </Link>
          <h1 className="text-3xl font-bold">Secure Your Stay</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form id="booking-form" onSubmit={handleSubmit}>

              {/* Guest Information */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-400" /> Guest Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Full Name *</label>
                    <input
                      type="text"
                      name="guestName"
                      value={formData.guestName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Maria Santos"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        <Phone className="w-3 h-3 inline mr-1" />Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. 09XX XXX XXXX"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        <Mail className="w-3 h-3 inline mr-1" />Email (optional)
                      </label>
                      <input
                        type="email"
                        name="guestEmail"
                        value={formData.guestEmail}
                        onChange={handleInputChange}
                        placeholder="e.g. maria@email.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Stay Details */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" /> Stay Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Check-in *</label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Check-out *</label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      min={formData.checkIn}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Guests *</label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Room *</label>
                    {loadingRooms ? (
                      <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading rooms...
                      </div>
                    ) : (
                      <select
                        name="roomId"
                        value={formData.roomId}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                      >
                        {rooms.map(room => (
                          <option key={room.id} value={String(room.id)}>
                            {room.name} — ₱{Number(room.price).toLocaleString()}/night
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-400" /> Payment
                </h2>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-sm text-orange-800 mb-2">GCash / Bank Transfer</h3>
                  <p className="text-sm text-orange-900 mb-4">
                    Scan the QR code below to pay the full amount of{" "}
                    <strong>₱{totalAmount.toLocaleString()}</strong>, then upload your payment screenshot below.
                  </p>
                  <div className="flex justify-center bg-white p-4 rounded-lg border border-orange-100 max-w-xs mx-auto">
                    <div className="w-48 h-48 bg-gray-800 flex items-center justify-center text-white text-xs text-center px-4">
                      [QR CODE — Add your GCash QR here]
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  {formData.paymentProof ? (
                    <p className="font-bold text-green-600">{formData.paymentProof.name}</p>
                  ) : (
                    <p className="font-bold text-gray-700">Click to upload payment screenshot *</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                </div>
              </section>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              <div className="space-y-3 mb-6 text-sm">
                {selectedRoom && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Room</span>
                      <span className="font-medium text-right max-w-[60%]">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate</span>
                      <span className="font-medium">₱{Number(selectedRoom.price).toLocaleString()}/night</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
                {formData.checkIn && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-medium">{formData.checkIn}</span>
                  </div>
                )}
                {formData.checkOut && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-medium">{formData.checkOut}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                form="booking-form"
                disabled={submitting}
                className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-orange-500 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  "Confirm Booking"
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                By confirming, you agree to our terms and cancellation policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
