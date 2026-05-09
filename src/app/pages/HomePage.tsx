import { useState } from "react";
import { Link } from "react-router";
import { ReviewModal } from "../components/ReviewModal";
import { Sun, Star, MapPin, Users, Calendar, Wifi, Coffee, Wind, ArrowRight, PenSquare } from "lucide-react";
import { motion } from "motion/react";

export function HomePage() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1637851522639-2d54fec9125e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0cm9waWNhbCUyMHJlc29ydCUyMGV4dGVyaW9yJTIwc3VubnklMjBwaGlsaXBwaW5lc3xlbnwxfHx8fDE3NzIyNTQ5MjN8MA&ixlib=rb-4.1.0&q=80&w=1080')" }}
        />
        
        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold mb-6">
              <Sun className="w-4 h-4 animate-spin-slow" />
              <span>24/7 Solar Power — No Brownouts!</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
              Stay Bright in Santa Fe
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-10 drop-shadow-md">
              Experience the perfect island getaway with uninterrupted comfort. 
              Relax, recharge, and enjoy the sunny vibe of Cebu.
            </p>
          </motion.div>

          {/* Search Bar Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '32px',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '32px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FACC15', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              <Wifi style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '1.125rem' }}>Free Wifi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FACC15', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 4 2.5 2.5"/><path d="M13.5 6.5a4.95 4.95 0 0 0-7 7"/><path d="M15 5 5 15"/><path d="M14 17v.01"/><path d="M10 16v.01"/><path d="M13 13v.01"/><path d="M16 10v.01"/><path d="M11 20v.01"/><path d="M17 14v.01"/><path d="M20 11v.01"/></svg>
              <span style={{ fontSize: '1.125rem' }}>Private CR w/ Shower</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FACC15', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              <Wind style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '1.125rem' }}>Airconditioned</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FACC15', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              <Coffee style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '1.125rem' }}>Free Coffee</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Room Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Stay</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're a solo backpacker or a couple seeking privacy, 
              we have the perfect solar-powered space for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Dorm Card */}
            <RoomCard 
              image="https://images.unsplash.com/photo-1549881567-c622c1080d78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtJTIwcm9vbSUyMGhvc3RlbCUyMGJ1bmslMjBiZWRzJTIwbW9kZXJufGVufDF8fHx8MTc3MjI1NDkyM3ww&ixlib=rb-4.1.0&q=80&w=1080"
              title="Barkada Room"
              price="₱800"
              unit="per night"
              capacity="8 Beds (Mixed)"
              amenities={['Aircon', 'Shared Bath', 'Free WiFi']}
              link="/rooms"
              delay={0.1}
            />

            {/* Private Card */}
            <RoomCard 
              image="https://images.unsplash.com/photo-1611892440504-42a792e24d32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwcHJpdmF0ZSUyMGhvdGVsJTIwcm9vbSUyMHRyb3BpY2FsJTIwYnJpZ2h0fGVufDF8fHx8MTc3MjI1NDkyM3ww&ixlib=rb-4.1.0&q=80&w=1080"
              title="Standard Room"
              price="₱1,200"
              unit="per night"
              capacity="2 Guests"
              amenities={['Free WiFi', 'Private Bath']}
              link="/rooms"
              delay={0.2}
              isPopular
            />
          </div>
          
          <div className="text-center mt-12">
            <Link to="/rooms" className="inline-flex items-center text-black font-bold border-b-2 border-yellow-400 pb-1 hover:text-yellow-600 transition-colors group">
              View All Rooms <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-100 rounded-full z-0"></div>
              <img 
                src="https://images.unsplash.com/photo-1564783538911-cd6bb5d6bed2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHRyYXZlbGVyJTIwcG9ydHJhaXQlMjBhc2lhbnxlbnwxfHx8fDE3NzIyNTQ5MjN8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Happy Guest" 
                className="relative z-10 rounded-2xl shadow-xl w-full max-w-md mx-auto object-cover aspect-[4/5]"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg z-20 max-w-xs hidden md:block border border-gray-100">
                <div className="flex text-yellow-400 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-sm font-medium text-gray-800">"Best stay in Santa Fe! The solar power was a lifesaver during the island brownout."</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">What Our Guests Say</h2>
                <button 
                  onClick={() => setIsReviewOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold text-black border border-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-colors"
                >
                  <PenSquare className="w-4 h-4" /> Write a Review
                </button>
              </div>
              <div className="space-y-8">
                <Testimonial 
                  name="Maria Santos"
                  date="April 2024"
                  review="I loved the cozy vibe and the friendly staff. The location is perfect, just a short walk to the beach. The solar power guarantee is real!"
                />
                <Testimonial 
                  name="John Doe"
                  date="March 2024"
                  review="Super clean rooms and the breakfast was delicious. Renting a bike directly from them made exploring the island so easy."
                />
                <Testimonial 
                  name="Sarah Lee"
                  date="February 2024"
                  review="Great value for money. The dorms are spacious and clean. Will definitely come back!"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] relative bg-gray-200">
        <img 
          src="https://images.unsplash.com/photo-1738528418555-32ca3188255b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwYWVyaWFsJTIwdmlldyUyMHBoaWxpcHBpbmVzfGVufDF8fHx8MTc3MjI1NDkyM3ww&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="Map Background" 
          className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm mx-4">
            <MapPin className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-bold text-xl mb-1">Find Us in Paradise</h3>
            <p className="text-gray-600 mb-4">A. Coyoca St, Santa Fe, Cebu</p>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
    </div>
  );
}

function RoomCard({ image, title, price, unit, capacity, amenities, link, delay, isPopular }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group hover:shadow-xl transition-shadow relative flex flex-col"
    >
      {isPopular && (
        <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm">
          MOST POPULAR
        </div>
      )}
      <div className="relative h-64 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <Sun className="w-3 h-3" /> 24/7 Power
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <div className="text-right">
            <span className="block text-xl font-bold text-black">{price}</span>
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <Users className="w-4 h-4 mr-2" />
          {capacity}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {amenities.map((item: string, i: number) => (
            <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">{item}</span>
          ))}
        </div>

        <div className="mt-auto">
          <Link to={link} className="block w-full text-center border border-black text-black font-bold py-3 rounded-lg hover:bg-black hover:text-white transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Testimonial({ name, date, review }: any) {
  return (
    <div className="border-l-4 border-yellow-400 pl-4 py-1">
      <div className="flex text-yellow-400 mb-2">
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
      </div>
      <p className="text-gray-600 italic mb-2">"{review}"</p>
      <div className="text-sm">
        <span className="font-bold text-black block">{name}</span>
        <span className="text-gray-400 text-xs">{date}</span>
      </div>
    </div>
  );
}