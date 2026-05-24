import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Sun, Wifi, Wind, BedDouble, Users, ChevronRight, BatteryCharging, Star, Loader2 } from "lucide-react";
import { supabase, type Room } from "../../lib/supabase";

const HIGHLIGHTS = [
  { icon: Sun, label: "Solar Powered", desc: "24/7 power, no brownouts" },
  { icon: Wifi, label: "Free WiFi", desc: "Fast internet in all rooms" },
  { icon: Wind, label: "Air-Conditioned", desc: "All rooms fully air-conditioned" },
  { icon: BedDouble, label: "Multiple Room Types", desc: "Standard, Family, Barkada & more" },
];

const PREVIEW_TYPES = ["Barkada", "Family", "Standard"];

export function HomePage() {
  const [previews, setPreviews] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreviews() {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, name, type, price, capacity, image_url, description")
        .in("type", PREVIEW_TYPES)
        .order("type")
        .order("id");

      if (!error && data) {
        // Pick one representative room per type
        const picked: Room[] = [];
        for (const type of PREVIEW_TYPES) {
          const match = data.find(r => r.type === type);
          if (match) picked.push(match as Room);
        }
        setPreviews(picked);
      }
      setLoading(false);
    }
    fetchPreviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
            alt="Property"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-orange-400/20 border border-orange-400/40 text-orange-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <BatteryCharging className="w-3.5 h-3.5" />
            100% Solar Powered — No Brownouts
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Your Home Away<br />
            <span className="text-orange-400">from Home</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-xl mb-8">
            Affordable, comfortable stays in Santa Fe, Cebu.
            Solar-powered rooms starting at <span className="text-orange-400 font-bold">₱1,000/night</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/rooms"
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl transition-colors flex items-center gap-2 justify-center"
            >
              Browse Rooms <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/calendar"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Check Availability
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-1">
                <Icon className="w-6 h-6 text-orange-500" />
              </div>
              <p className="font-bold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Room Previews */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Our Rooms</h2>
            <p className="text-gray-500 mt-1">Pick the room that fits your crew</p>
          </div>
          <Link to="/rooms" className="hidden md:flex items-center gap-1 text-orange-500 font-semibold hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previews.map(room => (
              <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src={room.image_url || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                    alt={room.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{room.name}</h3>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₱{Number(room.price).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">per night</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Up to {room.capacity} guests
                  </p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{room.description}</p>
                  <Link
                    to="/rooms"
                    className="block text-center bg-black text-white font-bold py-2.5 rounded-xl hover:bg-orange-500 transition-colors text-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Link to="/rooms" className="text-orange-500 font-semibold hover:underline flex items-center gap-1 justify-center">
            View All Rooms <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-orange-400 fill-orange-400" />
            ))}
          </div>
          <h2 className="text-3xl font-extrabold mb-3">
            Why Stay at <span className="text-orange-400">4vjsa Apartelle</span>?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-10">
            Located in the heart of Santa Fe, Cebu — steps away from beaches, markets, and local spots.
            Our solar-powered property means you'll never deal with brownout frustrations.
          </p>
          <Link
            to="/booking"
            className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-xl transition-colors"
          >
            Book Your Stay
          </Link>
        </div>
      </section>
    </div>
  );
}
