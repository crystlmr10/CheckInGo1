import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Coffee, Wifi, Wind, BedDouble, Users, ChevronRight, Star, Loader2, PenLine, Tag } from "lucide-react";
import { supabase, type Room, getDiscountSetting, type DiscountSetting } from "../../lib/supabase";
import { ReviewModal } from "../components/ReviewModal";

const REVIEWS = [
  { name: "Crystal Marie Giron", date: "April 2026", rating: 5, text: "I love the owner!" },
  { name: "Dan Monter", date: "March 2026", rating: 5, text: "Super clean rooms and the free coffee was a nice touch. Renting a bike directly from them made exploring the island so easy." },
  { name: "Philip Andre", date: "February 2026", rating: 5, text: "Great value for money. The rooms are spacious and clean. Will definitely come back!" },
];

const HIGHLIGHTS = [
  { icon: Coffee, label: "Free Coffee", desc: "Complimentary coffee every morning" },
  { icon: Wifi, label: "Free WiFi", desc: "Fast internet in all rooms" },
  { icon: Wind, label: "Air-Conditioned", desc: "All rooms fully air-conditioned" },
  { icon: BedDouble, label: "Multiple Room Types", desc: "Standard, Family, Barkada & more" },
];

const PREVIEW_TYPES = ["Barkada", "Family", "Standard"];

export function HomePage() {
  const [previews, setPreviews] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [discount, setDiscount] = useState<DiscountSetting>({ active: false, percent: 10 });

  const discountedPrice = (price: number) =>
    Math.round(price * (1 - discount.percent / 100));

  useEffect(() => {
    async function fetchPreviews() {
      const [{ data, error }] = await Promise.all([
        supabase
          .from("rooms")
          .select("id, name, type, price, capacity, image_url, description")
          .in("type", PREVIEW_TYPES)
          .order("type")
          .order("id"),
        getDiscountSetting().then(setDiscount),
      ]);

      if (!error && data) {
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
      {/* Sale Banner */}
      {discount.active && (
        <div className="bg-orange-500 text-white text-center py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold">
          <Tag className="w-4 h-4" />
          Special Offer — {discount.percent}% OFF on all rooms! Book now and save.
        </div>
      )}

      {/* Hero */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt="Property"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36 flex flex-col items-start text-left">

          <p style={{ fontFamily: 'Inter, sans-serif' }} className="text-xs font-semibold tracking-widest uppercase text-white mb-2">Welcome to CheckInGo</p>
          <h1 style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }} className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Chill Escape<br />
            Starts Here
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif' }} className="text-white font-medium text-lg md:text-xl max-w-xl mb-8">
            Check Availability of the chosen date, then book your favored room.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/rooms"
              className="bg-[#FFA500] hover:bg-[#FFB347] text-white font-bold px-8 py-4 rounded-xl transition-colors flex items-center gap-2 justify-center"
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
      <section className="bg-white py-14 border-b border-gray-100">
        <h2 style={{ fontFamily: 'Inter, sans-serif' }} className="text-2xl font-bold text-[#2C3E50] text-center mb-10">Why Book with Us?</h2>
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-[#F5F5F5] rounded-3xl p-8 flex flex-col items-center text-center gap-3 aspect-square justify-center">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-1">
                <Icon className="w-7 h-7 text-[#FFA500]" />
              </div>
              <p className="font-bold text-[#2C3E50]">{label}</p>
              <p className="text-sm text-[#2C3E50]/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Room Previews */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ fontFamily: 'Inter, sans-serif' }} className="text-3xl font-bold text-gray-900">Our Rooms</h2>
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
                      {discount.active ? (
                        <>
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs text-gray-400 line-through">
                              ₱{Number(room.price).toLocaleString()}
                            </span>
                            <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                              -{discount.percent}%
                            </span>
                          </div>
                          <p className="font-bold text-gray-900 text-green-600">
                            ₱{discountedPrice(Number(room.price)).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">per night</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-gray-900">₱{Number(room.price).toLocaleString()}</p>
                          <p className="text-xs text-gray-400">per night</p>
                        </>
                      )}
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

      {/* What Our Guests Say */}
      <section className="bg-[#FFF9EF] py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 style={{ fontFamily: 'Inter, sans-serif' }} className="text-3xl font-bold text-[#2C3E50]">What Our Guests Say</h2>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="flex items-center gap-2 border border-[#2C3E50] text-[#2C3E50] font-semibold px-4 py-2 rounded-xl hover:bg-[#2C3E50] hover:text-white transition-colors text-sm"
            >
              <PenLine className="w-4 h-4" /> Write a Review
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((review) => (
              <div key={review.name} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-[#FFA500]">
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#FFA500] fill-[#FFA500]" />
                  ))}
                </div>
                <p className="text-[#2C3E50]/80 text-sm italic mb-4">"{review.text}"</p>
                <p className="font-bold text-[#2C3E50] text-sm">{review.name}</p>
                <p className="text-[#2C3E50]/50 text-xs">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} />
    </div>
  );
}
