import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import { Calendar, CreditCard, ChevronLeft, Upload, Check, Loader2, User, Phone, Mail, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { supabase, type Room, getDiscountSetting, type DiscountSetting } from "../../lib/supabase";

const ROOM_GUEST_RANGE: Record<string, { min: number; max: number }> = {
  Single:   { min: 1, max: 1 },
  Standard: { min: 2, max: 3 },
  Family:   { min: 4, max: 5 },
  Barkada:  { min: 1, max: 8 },
};

function getNightlyRate(room: Room, guests: number): number {
  if (room.type === "Barkada") return Math.min(800 + (guests - 1) * 500, 3500);
  const range = ROOM_GUEST_RANGE[room.type];
  return Number(room.price) + (range ? Math.max(0, guests - range.min) * 300 : 0);
}

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get("room") || "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [discount, setDiscount] = useState<DiscountSetting>({ active: false, percent: 10 });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState("");
  const [dateConflict, setDateConflict] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guests: Number(searchParams.get("guests")) || 2,
    roomId: initialRoomId,
    paymentProof: null as File | null,
  });

  useEffect(() => {
    async function fetchData() {
      const [roomsResult] = await Promise.all([
        supabase
          .from("rooms")
          .select("id, name, type, price, capacity")
          .gt("available", 0)
          .order("type")
          .order("name"),
        getDiscountSetting().then(setDiscount),
      ]);
      const { data, error } = roomsResult;
      if (!error && data) {
        setRooms(data as Room[]);
        const firstRoom = initialRoomId
          ? data.find(r => String(r.id) === initialRoomId)
          : data[0];
        if (firstRoom) {
          const range = ROOM_GUEST_RANGE[firstRoom.type] ?? { min: 1, max: 8 };
          setFormData(prev => ({
            ...prev,
            roomId: String(firstRoom.id),
            guests: Math.min(Math.max(prev.guests, range.min), range.max),
          }));
        }
      }
      setLoadingRooms(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const { roomId, checkIn, checkOut } = formData;
    if (!roomId || !checkIn || !checkOut || checkOut <= checkIn) {
      setDateConflict(false);
      return;
    }
    let cancelled = false;
    setCheckingConflict(true);
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("room_id", Number(roomId))
      .in("status", ["approved", "pending"])
      .lt("check_in", checkOut)
      .gt("check_out", checkIn)
      .then(({ count }) => {
        if (!cancelled) {
          setDateConflict((count ?? 0) > 0);
          setCheckingConflict(false);
        }
      });
    return () => { cancelled = true; };
  }, [formData.roomId, formData.checkIn, formData.checkOut]);

  const selectedRoom = rooms.find(r => String(r.id) === formData.roomId) || rooms[0];
  const guestRange = selectedRoom ? (ROOM_GUEST_RANGE[selectedRoom.type] ?? { min: 1, max: 8 }) : { min: 2, max: 2 };
  const guestOptions = Array.from({ length: guestRange.max - guestRange.min + 1 }, (_, i) => guestRange.min + i);

  const nights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 1;
    const diff = new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [formData.checkIn, formData.checkOut]);

  const baseRate = selectedRoom ? getNightlyRate(selectedRoom, formData.guests) : 0;
  const nightlyRate = discount.active ? Math.round(baseRate * (1 - discount.percent / 100)) : baseRate;
  const totalAmount = nightlyRate * nights;
  const reservationFee = 1000;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    const room = rooms.find(r => String(r.id) === roomId);
    const range = room ? (ROOM_GUEST_RANGE[room.type] ?? { min: 1, max: 8 }) : { min: 1, max: 8 };
    setFormData(prev => ({
      ...prev,
      roomId,
      guests: Math.min(Math.max(prev.guests, range.min), range.max),
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (digits.length >= 1 && digits[0] !== "0") digits = "0" + digits.slice(0, 10);
    if (digits.length >= 2 && digits[1] !== "9") digits = digits[0] + "9" + digits.slice(2, 11);
    let formatted = digits;
    if (digits.length > 7) formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    else if (digits.length > 4) formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
    setFormData(prev => ({ ...prev, guestPhone: formatted }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, paymentProof: e.target.files![0] }));
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    if (!formData.paymentProof) {
      setSubmitError("Please upload your payment screenshot before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Re-check conflict at submit time
      const { count } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("room_id", Number(formData.roomId))
        .in("status", ["approved", "pending"])
        .lt("check_in", formData.checkOut)
        .gt("check_out", formData.checkIn);

      if ((count ?? 0) > 0) {
        setSubmitError("This room is already booked for the selected dates. Please choose different dates.");
        setSubmitting(false);
        return;
      }

      // 2. Convert payment proof to base64
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
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          guests: formData.guests,
          total_amount: totalAmount,
          reservation_fee: reservationFee,
          balance: totalAmount - reservationFee,
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
              <span className="font-bold">₱{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reservation Fee Paid</span>
              <span className="font-bold text-green-600">₱{reservationFee.toLocaleString()}</span>
            </div>
            {totalAmount - reservationFee > 0 && (
              <div className="flex justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                <span className="text-orange-800 font-semibold">Balance Due at Check-in</span>
                <span className="font-bold text-orange-700">₱{(totalAmount - reservationFee).toLocaleString()}</span>
              </div>
            )}
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
                        onChange={handlePhoneChange}
                        required
                        pattern="09\d{2} \d{3} \d{4}"
                        maxLength={13}
                        title="Phone number must be in the format 09XX XXX XXXX"
                        placeholder="e.g. 09XX XXX XXXX"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        <Mail className="w-3 h-3 inline mr-1" />Email *
                      </label>
                      <input
                        type="email"
                        name="guestEmail"
                        value={formData.guestEmail}
                        onChange={handleInputChange}
                        required
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
                      className={`w-full bg-gray-50 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none ${dateConflict ? "border-red-400" : "border-gray-200"}`}
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
                      className={`w-full bg-gray-50 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none ${dateConflict ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                </div>
                {checkingConflict && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                  </div>
                )}
                {!checkingConflict && dateConflict && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    This room is already booked for the selected dates. Please choose different dates or a different room.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        onChange={handleRoomChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                      >
                        {rooms.map(room => (
                          <option key={room.id} value={String(room.id)}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Guests *</label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
                    >
                      {guestOptions.map(n => (
                        <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-400" /> Payment
                </h2>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-sm text-orange-800 mb-2">GCash / Bank Transfer</h3>
                  <p className="text-sm text-orange-900 mb-1">
                    Scan the QR code below to pay the reservation fee of{" "}
                    <strong>₱{reservationFee.toLocaleString()}</strong>, then upload your payment screenshot below.
                  </p>
                  <p className="text-xs text-orange-700 mb-4">
                    Remaining balance of <strong>₱{(totalAmount - reservationFee).toLocaleString()}</strong> is due upon check-in.
                  </p>
                  <div className="flex justify-center bg-white p-4 rounded-lg border border-orange-100 max-w-xs mx-auto">
                    <div className="w-48 h-48 bg-gray-800 flex items-center justify-center text-white text-xs text-center px-4">
                      [QR CODE — Add your GCash QR here]
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-xs text-red-700">
                  <strong>Cancellation Policy:</strong> Only 40% of the reservation fee will be refunded in case of cancellation or no-show.
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
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500">Rate</span>
                      <span className="text-right">
                        {discount.active && (
                          <span className="block text-xs line-through text-gray-400">₱{baseRate.toLocaleString()}/night</span>
                        )}
                        <span className="font-medium">₱{nightlyRate.toLocaleString()}/night</span>
                        {discount.active && (
                          <span className="ml-1 text-xs bg-orange-100 text-orange-700 font-bold px-1 rounded">-{discount.percent}%</span>
                        )}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-medium">{formData.guests}</span>
                </div>
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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reservation Fee (now)</span>
                  <span className="font-bold text-green-600">₱{reservationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Balance at check-in</span>
                  <span>₱{(totalAmount - reservationFee).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                form="booking-form"
                disabled={submitting || dateConflict || checkingConflict}
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
