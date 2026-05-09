import { useState } from "react";
import { Link } from "react-router";
import { Search, SlidersHorizontal, User, Wifi, Wind, Coffee, Sun, X, ChevronLeft, ChevronRight, MapPin, Maximize, Bed } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ROOMS = [
  // 1st Floor
  {
    id: 1,
    name: "Standard Room 1",
    type: "Standard Room",
    price: 1200,
    capacity: 2,
    maxCapacity: 2,
    floor: "1st Floor",
    bedType: "1 Double Bed",
    description: "Located on the ground floor with easy access. Features a comfortable double bed. Extra bed available for an additional charge.",
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55dd580e5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },
  {
    id: 2,
    name: "Standard Room 2",
    type: "Standard Room",
    price: 1200,
    capacity: 2,
    maxCapacity: 2,
    floor: "1st Floor",
    bedType: "1 Double Bed",
    description: "Located on the ground floor with easy access. Features a comfortable double bed. Extra bed available for an additional charge.",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },
  {
    id: 3,
    name: "Standard Room 3",
    type: "Standard Room",
    price: 1200,
    capacity: 2,
    maxCapacity: 2,
    floor: "1st Floor",
    bedType: "1 Double Bed",
    description: "Located on the ground floor with easy access. Features a comfortable double bed. Extra bed available for an additional charge.",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },
  {
    id: 4,
    name: "Standard Room 4",
    type: "Standard Room",
    price: 1200,
    capacity: 2,
    maxCapacity: 2,
    floor: "1st Floor",
    bedType: "1 Double Bed",
    description: "Located on the ground floor with easy access. Features a comfortable double bed. Extra bed available for an additional charge.",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 0,
  },

  // 2nd Floor
  {
    id: 5,
    name: "Standard Room 5",
    type: "Standard Room",
    price: 1200,
    capacity: 2,
    maxCapacity: 2,
    floor: "2nd Floor",
    bedType: "1 Double Bed",
    description: "Elevated standard room good for 2 persons. Extra bed available for an additional charge.",
    images: [
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },
  {
    id: 6,
    name: "Family Room 6",
    type: "Family Room",
    price: 1500,
    capacity: 4,
    maxCapacity: 4,
    floor: "2nd Floor",
    bedType: "1 Single King Size Bed",
    description: "Spacious family room on the second floor with a large King Size bed. Extra beds available for additional charges.",
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },
  {
    id: 7,
    name: "Standard Room 7",
    type: "Standard Room",
    price: 1200,
    capacity: 2,
    maxCapacity: 2,
    floor: "2nd Floor",
    bedType: "1 Double Bed",
    description: "Elevated standard room good for 2 persons. Extra bed available for an additional charge.",
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },
  {
    id: 8,
    name: "Single Room 8",
    type: "Single Room",
    price: 1000,
    capacity: 1,
    maxCapacity: 1,
    floor: "2nd Floor",
    bedType: "1 Single Bed",
    description: "A cozy and private space on the second floor. Extra bed available for an additional charge.",
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },
  {
    id: 9,
    name: "Standard Room 9",
    type: "Standard Room",
    price: 1200,
    capacity: 2,
    maxCapacity: 2,
    floor: "2nd Floor",
    bedType: "1 Double Bed",
    description: "Elevated standard room good for 2 persons. Extra bed available for an additional charge.",
    images: [
      "https://images.unsplash.com/photo-1574643034937-290234a94868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },

  // 3rd Floor
  {
    id: 10,
    name: "Barkada Room 10",
    type: "Barkada Room",
    price: 3500,
    capacity: 8,
    maxCapacity: 8,
    floor: "3rd Floor",
    bedType: "Bunk Beds (Double Deck)",
    description: "A spacious 8-bed room on the top floor with sturdy bunk beds. Perfect for large friend groups.",
    images: [
      "https://images.unsplash.com/photo-1549881567-c622c1080d78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1522771731478-44fb5bc65ab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Shared Bath", "Floor WiFi"],
    available: 4,
  },
  {
    id: 11,
    name: "Family Room 11",
    type: "Family Room",
    price: 1500,
    capacity: 4,
    maxCapacity: 4,
    floor: "3rd Floor",
    bedType: "Twin Bed",
    description: "Beautiful family suite on the top floor featuring twin beds. Extra beds available for additional charges.",
    images: [
      "https://images.unsplash.com/photo-1637851522639-2d54fec9125e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    ],
    amenities: ["AC", "Private Bath", "Floor WiFi"],
    available: 1,
  },
];

export function RoomsPage() {
  const [filterType, setFilterType] = useState<"All" | "Standard Room" | "Barkada Room" | "Family Room" | "Single Room">("All");
  const [priceRange, setPriceRange] = useState<number>(5000);
  
  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentGalleryRoom, setCurrentGalleryRoom] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredRooms = ROOMS.filter(room => {
    if (filterType !== "All" && room.type !== filterType) return false;
    if (room.price > priceRange) return false;
    return true;
  });

  const openGallery = (room: any) => {
    setCurrentGalleryRoom(room);
    setCurrentImageIndex(0);
    setGalleryOpen(true);
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setTimeout(() => {
      setCurrentGalleryRoom(null);
    }, 300);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentGalleryRoom) {
      setCurrentImageIndex((prev) => (prev + 1) % currentGalleryRoom.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentGalleryRoom) {
      setCurrentImageIndex((prev) => (prev - 1 + currentGalleryRoom.images.length) % currentGalleryRoom.images.length);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-center">Our Rooms</h1>
        <p className="text-center text-gray-500 mb-12">Find your perfect space in our 3-story solar-powered sanctuary.</p>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-12 flex flex-col md:flex-row gap-8 items-center justify-center border border-gray-100">
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 md:justify-center">
            <button 
              onClick={() => setFilterType("All")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${filterType === "All" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              All Rooms
            </button>
            <button 
              onClick={() => setFilterType("Standard Room")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${filterType === "Standard Room" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Standard Rooms
            </button>
            <button 
              onClick={() => setFilterType("Family Room")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${filterType === "Family Room" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Family Rooms
            </button>
            <button 
              onClick={() => setFilterType("Single Room")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${filterType === "Single Room" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Single Room
            </button>
            <button 
              onClick={() => setFilterType("Barkada Room")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${filterType === "Barkada Room" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Barkada Room
            </button>
          </div>
        </div>

        {/* Room List */}
        <div className="grid grid-cols-1 gap-8">
          {filteredRooms.map((room) => (
            <motion.div 
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col md:flex-row"
            >
              {/* Image Section - Clickable for gallery */}
              <div 
                className="md:w-[40%] relative h-64 md:h-auto cursor-pointer group"
                onClick={() => openGallery(room)}
              >
                <img 
                  src={room.images[0]} 
                  alt={room.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 duration-300">
                    <Search className="w-4 h-4" /> View Gallery ({room.images.length})
                  </div>
                </div>

                <div className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Sun className="w-3 h-3" /> Solar Powered
                </div>
                
                {room.available === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <div className="bg-red-500 text-white font-bold text-xl px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg border-2 border-white transform -rotate-12">
                      <X className="w-6 h-6" />
                      BOOKED
                    </div>
                  </div>
                )}
              </div>
              
              {/* Details Section */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-white z-10 relative">
                <div>
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{room.name}</h3>
                      <div className="text-gray-500 text-sm flex flex-col gap-1 mt-2">
                        <span className="font-medium text-gray-700">{room.type}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {room.maxCapacity} Guests Max</span>
                        {room.type !== 'Barkada Room' && (
                          <span className="text-xs text-blue-600 italic">*Extra bed available for additional charge</span>
                        )}
                      </div>
                    </div>
                    <div className="text-left lg:text-right bg-yellow-50 lg:bg-transparent p-3 lg:p-0 rounded-xl lg:rounded-none w-full lg:w-auto">
                      <div className="text-2xl font-bold text-black">₱{room.price}</div>
                      <div className="text-xs text-gray-500">per night</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-2">
                    {room.description}
                  </p>

                  {/* Room Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Level</span>
                      <span className="text-sm font-medium flex items-center gap-1 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" /> {room.floor}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Beds</span>
                      <span className="text-sm font-medium flex items-center gap-1 text-gray-700 truncate">
                        <Bed className="w-4 h-4 text-gray-400" /> {room.bedType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, i) => (
                      <span key={i} className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-md font-medium">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-end border-t border-gray-100 pt-6 gap-4">
                  <Link 
                    to={`/booking?room=${room.id}`}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all text-center ${
                      room.available > 0 
                        ? 'bg-black text-white hover:bg-yellow-400 hover:text-black shadow-lg hover:shadow-xl hover:-translate-y-0.5' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    {room.available > 0 ? 'Book This Room' : 'Unavailable'}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Gallery Modal */}
      <AnimatePresence>
        {galleryOpen && currentGalleryRoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm"
            onClick={closeGallery}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 text-white hover:text-yellow-400 z-10 p-2 bg-black/50 rounded-full transition-colors"
              onClick={closeGallery}
            >
              <X className="w-8 h-8" />
            </button>

            {/* Room Info Header */}
            <div className="absolute top-6 left-6 text-white z-10 max-w-[70%]">
              <h2 className="text-2xl font-bold text-yellow-400">{currentGalleryRoom.name}</h2>
              <p className="text-gray-300 text-sm">{currentGalleryRoom.type} • {currentGalleryRoom.floor}</p>
            </div>

            {/* Main Image Area */}
            <div 
              className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            >
              {currentGalleryRoom.images.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 z-10 text-white p-3 bg-black/50 hover:bg-yellow-400 hover:text-black rounded-full transition-all"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    className="absolute right-4 z-10 text-white p-3 bg-black/50 hover:bg-yellow-400 hover:text-black rounded-full transition-all"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={currentGalleryRoom.images[currentImageIndex]}
                  alt={`${currentGalleryRoom.name} - Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-widest backdrop-blur-md">
                {currentImageIndex + 1} / {currentGalleryRoom.images.length}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {currentGalleryRoom.images.length > 1 && (
              <div 
                className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4 overflow-x-auto py-2"
                onClick={(e) => e.stopPropagation()}
              >
                {currentGalleryRoom.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      currentImageIndex === idx 
                        ? 'ring-4 ring-yellow-400 scale-110 opacity-100 z-10' 
                        : 'opacity-50 hover:opacity-100 scale-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
