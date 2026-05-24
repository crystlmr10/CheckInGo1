import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { User, Loader2 } from "lucide-react";
import { supabase, type Room } from "../../lib/supabase";

const CATEGORIES = ["Barkada", "Family", "Standard", "Single"];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Barkada");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase.from("rooms").select("*").order("id");
      if (error) {
        setFetchError(error.message);
      } else if (data) {
        setRooms(data);
      }
      setLoading(false);
    }
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(
    r => r.type.toLowerCase() === activeCategory.toLowerCase()
  );

  const openModal = (room: Room) => {
    setSelectedRoom(room);
    setGuests(1);
    setCheckIn("");
    setCheckOut("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 max-w-md text-center">
          <p className="font-bold mb-1">Failed to load rooms</p>
          <p className="text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Orange Header Bar */}
      <div className="bg-orange-500 px-6 md:px-10 py-5 flex flex-wrap items-center gap-4">
        <h1 className="text-white text-3xl font-bold mr-4">Rooms</h1>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full font-semibold text-sm transition-colors ${
                activeCategory === cat
                  ? "bg-white text-orange-500"
                  : "text-white border border-white/50 hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Room List */}
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-4">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-medium">
            No rooms found in this category.
          </div>
        ) : (
          filteredRooms.map(room => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row"
            >
              {/* Image */}
              <div className="sm:w-52 h-48 sm:h-auto flex-shrink-0">
                <img
                  src={room.image_url || FALLBACK_IMAGE}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{room.name}</h3>
                      <p className="text-gray-500 text-sm">{room.type} Room • {room.floor}</p>
                      {room.bed_type && (
                        <p className="text-gray-500 text-sm">{room.bed_type}</p>
                      )}
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" /> {room.capacity} Guests Max
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-xl text-gray-900">₱{Number(room.price).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">per night</p>
                    </div>
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {room.amenities.map(a => (
                        <span key={a} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-100">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">
                    {room.description}
                  </p>
                </div>

                <div className="mt-4 flex justify-end">
                  {room.available > 0 ? (
                    <button
                      onClick={() => openModal(room)}
                      className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors"
                    >
                      Book Now
                    </button>
                  ) : (
                    <span className="bg-red-100 text-red-500 px-6 py-2 rounded-lg text-sm font-bold">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick-Book Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedRoom(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Room preview */}
              <div className="flex gap-4 mb-5">
                <img
                  src={selectedRoom.image_url || FALLBACK_IMAGE}
                  alt={selectedRoom.name}
                  className="w-32 h-24 rounded-xl object-cover flex-shrink-0"
                />
                <div>
                  <h2 className="font-bold text-xl text-gray-900">{selectedRoom.name}</h2>
                  <p className="text-gray-500 text-sm">{selectedRoom.type} Room</p>
                  {selectedRoom.bed_type && (
                    <p className="text-gray-500 text-sm">{selectedRoom.bed_type}</p>
                  )}
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" /> {selectedRoom.capacity} Guests Max
                  </p>
                </div>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Guest count */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Number of Guests</label>
                <select
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {Array.from({ length: selectedRoom.capacity }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <Link
                  to={`/booking?room=${selectedRoom.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                  className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-xl text-center hover:bg-orange-600 transition-colors"
                >
                  Continue to Book
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
