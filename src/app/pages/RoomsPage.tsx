import { useState, useEffect } from "react";
import { Link } from "react-router";
import { User, Loader2 } from "lucide-react";
import { supabase, type Room } from "../../lib/supabase";

const CATEGORIES = ["All Rooms", "Barkada", "Family", "Standard", "Single"];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All Rooms");

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

  const filteredRooms = activeCategory === "All Rooms"
    ? rooms
    : rooms.filter(r => r.type.toLowerCase() === activeCategory.toLowerCase());


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
      <div className="bg-[#FFB347] px-6 md:px-10 py-5 flex flex-wrap items-center gap-4">
        <h1 className="text-white text-3xl font-bold mr-4">Rooms</h1>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full font-semibold text-sm transition-colors ${
                activeCategory === cat
                  ? "bg-white text-black"
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
                    <Link
                      to={`/booking?room=${room.id}`}
                      className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors"
                    >
                      Book Now
                    </Link>
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

    </div>
  );
}
