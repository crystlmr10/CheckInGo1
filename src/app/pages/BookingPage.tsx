import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { Calendar, User, Truck, Utensils, CreditCard, ChevronLeft, Upload, Check } from "lucide-react";
import { motion } from "motion/react";

const ROOM_TYPES = [
  { id: "1", name: "Barkada Bunk Bed", price: 800 },
  { id: "2", name: "Standard Room", price: 1200 },
  { id: "3", name: "Single Room", price: 1000 },
  { id: "4", name: "Family Room", price: 1500 },
];

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get("room") || "1";
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomId: initialRoomId,
    rentMotorcycle: false,
    rentBicycle: false,
    breakfastFilipino: false,
    breakfastContinental: false,
    breakfastPancakes: false,
    breakfastFilipinoQty: 1,
    breakfastContinentalQty: 1,
    breakfastPancakesQty: 1,
    paymentProof: null as File | null,
  });

  const selectedRoom = ROOM_TYPES.find(r => r.id === formData.roomId) || ROOM_TYPES[0];
  
  // Calculate totals
  const nights = 2; // Mock nights calculation
  const roomTotal = selectedRoom.price * nights;
  const ridesTotal = (formData.rentMotorcycle ? 500 : 0) + (formData.rentBicycle ? 200 : 0);
  const breakfastTotal = 
    (formData.breakfastFilipino ? 150 * formData.breakfastFilipinoQty : 0) +
    (formData.breakfastContinental ? 150 * formData.breakfastContinentalQty : 0) +
    (formData.breakfastPancakes ? 120 * formData.breakfastPancakesQty : 0);
  
  const totalAmount = roomTotal + ridesTotal + breakfastTotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, paymentProof: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
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
          <h2 className="text-3xl font-bold mb-2">Booking Requested!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for choosing 4VJ's BrightBook. We have received your payment proof and are reviewing it. You will receive an SMS confirmation shortly.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl mb-8 text-left text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono font-bold">#BB-{Math.floor(Math.random() * 10000)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-600">₱{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">PENDING REVIEW</span>
            </div>
          </div>
          <Link to="/" className="block w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition-colors">
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
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-8">
            <form id="booking-form" onSubmit={handleSubmit}>
              
              {/* Stay Details */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" /> Stay Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Check-in</label>
                    <input 
                      type="date" 
                      name="checkIn"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Check-out</label>
                    <input 
                      type="date" 
                      name="checkOut"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Guests</label>
                    <select 
                      name="guests"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                      value={formData.guests}
                      onChange={handleInputChange}
                    >
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Room Type</label>
                    <select 
                      name="roomId"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                      value={formData.roomId}
                      onChange={handleInputChange}
                    >
                      {ROOM_TYPES.map(room => (
                        <option key={room.id} value={room.id}>{room.name} (₱{room.price}/night)</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Add-ons */}




              {/* Payment */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-400" /> Payment
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-sm text-yellow-800 mb-2">Instructions</h3>
                  <p className="text-sm text-yellow-900 mb-4">
                    Please scan the QR code below using GCash or your bank app to pay the required down payment of <strong>₱1,000</strong>. 
                    Then, upload a screenshot of your payment receipt.
                  </p>
                  <div className="flex justify-center bg-white p-4 rounded-lg border border-yellow-100 max-w-xs mx-auto">
                    {/* Placeholder QR */}
                    <div className="w-48 h-48 bg-gray-800 flex items-center justify-center text-white text-xs">
                      [QR CODE PLACEHOLDER]
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-yellow-400 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-700">
                    {formData.paymentProof ? formData.paymentProof.name : "Click to upload payment screenshot"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                </div>
              </section>

            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room ({nights} nights)</span>
                  <span className="font-bold">₱{roomTotal.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400 pl-2">
                  {selectedRoom.name} x {nights}
                </div>

                {ridesTotal > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Ride Rentals</span>
                    <span className="font-bold">+ ₱{ridesTotal.toLocaleString()}</span>
                  </div>
                )}

                {breakfastTotal > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Breakfast Orders</span>
                    <span className="font-bold">+ ₱{breakfastTotal.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold">
                  <span>Total Due</span>
                  <span>₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="booking-form"
                className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-yellow-400 hover:text-black transition-colors shadow-lg"
              >
                Confirm Booking
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
