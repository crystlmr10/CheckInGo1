import { Outlet, Link, useLocation } from "react-router";
import { Menu, X, Sun, BatteryCharging } from "lucide-react";
import { useState } from "react";
import { ChatWidget } from "./ChatWidget";

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900">
      {/* Top Bar - Solar Branding */}
      <div className="bg-black text-orange-400 py-2 px-4 text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-2">
        <Sun className="w-4 h-4 animate-spin-slow" />
        <span>24/7 Solar Power — No Brownouts!</span>
        <BatteryCharging className="w-4 h-4 ml-1" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">CheckInGo</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" current={location.pathname}>Home</NavLink>
            <NavLink to="/rooms" current={location.pathname}>Rooms</NavLink>
            <NavLink to="/calendar" current={location.pathname}>Calendar</NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4 shadow-lg">
            <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
            <MobileNavLink to="/rooms" onClick={() => setIsMenuOpen(false)}>Rooms</MobileNavLink>
            <MobileNavLink to="/booking" onClick={() => setIsMenuOpen(false)}>Book Now</MobileNavLink>
            <MobileNavLink to="/admin/login" onClick={() => setIsMenuOpen(false)}>Owner Login</MobileNavLink>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t-4 border-orange-400">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
                <Sun className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">CheckInGo</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Experience the sunny island vibe with reliable comfort. 
              Our solar-powered property ensures your stay is bright, eco-friendly, and uninterrupted.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-orange-400 text-sm font-medium">
              <Sun className="w-4 h-4" />
              <span>100% Solar Powered</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-400">Location</h3>
            <p className="text-gray-300 mb-2">A. Coyoca St, Santa Fe</p>
            <p className="text-gray-300 mb-2">Cebu, Philippines</p>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-white underline">
              View on Map
            </a>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-400">Contact</h3>
            <p className="text-gray-300 mb-2">+63 929 6280 763</p>
            <p className="text-gray-300 mb-2">0418vjsapartelle@gmail.com</p>
            <div className="mt-4 flex justify-center md:justify-start gap-4">
              {/* Social Icons Placeholder */}
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-400 hover:text-black transition-colors cursor-pointer">FB</div>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-400 hover:text-black transition-colors cursor-pointer">IG</div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-xs">
          <span>© {new Date().getFullYear()} CheckInGo. All rights reserved.</span>
          <Link to="/admin/login" className="text-gray-600 hover:text-orange-400 transition-colors">
            Owner Login
          </Link>
        </div>
      </footer>
      
      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}

function NavLink({ to, current, children }: { to: string, current: string, children: React.ReactNode }) {
  const isActive = current === to;
  return (
    <Link 
      to={to} 
      className={`text-sm font-medium transition-colors hover:text-orange-500 ${isActive ? 'text-black font-bold' : 'text-gray-600'}`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, onClick, children }: { to: string, onClick: () => void, children: React.ReactNode }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className="block py-2 text-base font-medium text-gray-800 border-b border-gray-50 hover:text-orange-600 hover:pl-2 transition-all"
    >
      {children}
    </Link>
  );
}
