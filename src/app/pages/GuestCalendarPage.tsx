import { useState, useEffect, useMemo, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, type Room } from "../../lib/supabase";

type BookingSlot = { room_id: number; check_in: string; check_out: string };

const CATEGORIES = [
  { id: "Barkada", label: "Barkada Room (8-Bed)" },
  { id: "Standard", label: "Standard Rooms" },
  { id: "Family", label: "Family Rooms" },
  { id: "Single", label: "Single Room" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toDateStr(date: Date) {
  return date.toISOString().split("T")[0];
}

export function GuestCalendarPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [searchedRange, setSearchedRange] = useState<{ start: Date; end: Date } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: Date;
    availableRooms: Room[];
    isAvailable: boolean;
    bedsLeft: number;
  } | null>(null);

  // Fetch rooms once
  useEffect(() => {
    supabase
      .from("rooms")
      .select("id, name, type, price, capacity, available")
      .order("id")
      .then(({ data, error }) => {
        if (!error && data) setRooms(data as Room[]);
      });
  }, []);

  // Fetch bookings whenever the visible month changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = toDateStr(new Date(year, month, 1));
    const lastDay = toDateStr(new Date(year, month + 1, 0));

    supabase
      .from("bookings")
      .select("room_id, check_in, check_out")
      .neq("status", "rejected")
      .lte("check_in", lastDay)
      .gte("check_out", firstDay)
      .then(({ data, error }) => {
        if (!error && data) setBookings(data as BookingSlot[]);
      });
  }, [currentDate]);

  const activeCategoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label;

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const availability = useMemo(() => {
    const grid: Record<string, { isAvailable: boolean; availableRooms: Room[]; bedsLeft: number }> = {};
    const categoryRooms = rooms.filter(r => r.type === selectedCategory && r.available > 0);

    calendarDays.forEach(date => {
      if (!date) return;

      const dateStr = toDateStr(date);

      // Find which room IDs are booked on this date
      const bookedRoomIds = new Set(
        bookings
          .filter(b => b.check_in <= dateStr && b.check_out > dateStr)
          .map(b => b.room_id)
      );

      const availableRooms = categoryRooms.filter(r => !bookedRoomIds.has(r.id));
      const isAvailable = availableRooms.length > 0;

      // For Barkada: count how many barkada bookings exist on this date
      // and subtract from total capacity to estimate beds left
      let bedsLeft = 0;
      if (selectedCategory === "Barkada" && isAvailable) {
        const barkadaRooms = categoryRooms;
        const barkadaBookingsOnDate = bookings.filter(
          b =>
            b.check_in <= dateStr &&
            b.check_out > dateStr &&
            barkadaRooms.some(r => r.id === b.room_id)
        ).length;
        const totalCapacity = barkadaRooms.reduce((s, r) => s + r.capacity, 0);
        bedsLeft = Math.max(0, totalCapacity - barkadaBookingsOnDate * 2);
      }

      grid[date.toISOString()] = { isAvailable, availableRooms, bedsLeft };
    });

    return grid;
  }, [calendarDays, selectedCategory, rooms, bookings]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div style={{ padding: "60px 20px", backgroundColor: "#FFFFFF", minHeight: "calc(100vh - 64px)", fontFamily: "system-ui, sans-serif", position: "relative" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <h1 style={{ fontSize: "2.5rem", color: "#0F172A", margin: "0 0 8px 0", fontWeight: "900" }}>Availability Calendar</h1>
            <p style={{ textAlign: "center", color: "#6B7280", margin: 0, fontSize: "1.1rem" }}>
              Real-time room availability based on confirmed bookings.
            </p>
          </div>

          {/* Category Filters */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
            {CATEGORIES.map(category => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    whiteSpace: "nowrap", padding: "10px 24px", borderRadius: "9999px",
                    border: isActive ? "2px solid #000" : "2px solid #E5E7EB",
                    backgroundColor: isActive ? "#F97316" : "#FFFFFF",
                    color: "#000", fontWeight: "bold", fontSize: "0.95rem",
                    cursor: "pointer", transition: "all 0.2s ease", outline: "none",
                  }}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Date Range Search */}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: "24px", marginBottom: "40px", padding: "24px", backgroundColor: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
              <label htmlFor="check-in" style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#475569", textTransform: "uppercase" }}>Check-In Date</label>
              <input
                type="date" id="check-in" value={checkInDate}
                onChange={e => setCheckInDate(e.target.value)}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #CBD5E1", backgroundColor: "#FFF", fontSize: "1rem", outline: "none", width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
              <label htmlFor="check-out" style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#475569", textTransform: "uppercase" }}>Check-Out Date</label>
              <input
                type="date" id="check-out" value={checkOutDate} min={checkInDate}
                onChange={e => setCheckOutDate(e.target.value)}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #CBD5E1", backgroundColor: "#FFF", fontSize: "1rem", outline: "none", width: "100%" }}
              />
            </div>
            <button
              onClick={() => {
                if (checkInDate && checkOutDate) {
                  const [inY, inM, inD] = checkInDate.split("-").map(Number);
                  const [outY, outM, outD] = checkOutDate.split("-").map(Number);
                  setSearchedRange({ start: new Date(inY, inM - 1, inD), end: new Date(outY, outM - 1, outD) });
                  setCurrentDate(new Date(inY, inM - 1, 1));
                  setTimeout(() => calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
                }
              }}
              disabled={!checkInDate || !checkOutDate}
              style={{ padding: "12px 32px", borderRadius: "12px", border: "none", backgroundColor: (!checkInDate || !checkOutDate) ? "#E2E8F0" : "#000", color: (!checkInDate || !checkOutDate) ? "#94A3B8" : "#F97316", fontSize: "1rem", fontWeight: "bold", cursor: (!checkInDate || !checkOutDate) ? "not-allowed" : "pointer", height: "48px", minWidth: "200px" }}
            >
              Check Availability
            </button>
          </div>

          {/* Month Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginBottom: "32px" }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: "#000", display: "flex" }}>
              <ChevronLeft size={36} />
            </button>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#0F172A", margin: 0, minWidth: "220px", textAlign: "center" }}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: "#000", display: "flex" }}>
              <ChevronRight size={36} />
            </button>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { color: "#F0FDF4", border: "#86EFAC", label: "Available" },
              { color: "#FEE2E2", border: "#FCA5A5", label: "Fully Booked" },
              { color: "#E0F2FE", border: "#38BDF8", label: "Your Selected Range" },
            ].map(({ color, border, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#475569" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: color, border: `1px solid ${border}` }} />
                {label}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div ref={calendarRef} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
            {WEEKDAYS.map(day => (
              <div key={day} style={{ textAlign: "center", fontWeight: "bold", color: "#9CA3AF", fontSize: "0.9rem", paddingBottom: "8px" }}>{day}</div>
            ))}

            {calendarDays.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} style={{ minHeight: "80px" }} />;

              const dateStr = date.toISOString();
              const info = availability[dateStr] ?? { isAvailable: false, availableRooms: [], bedsLeft: 0 };
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              let isInRange = false;
              if (searchedRange) {
                const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                isInRange = d >= searchedRange.start.getTime() && d <= searchedRange.end.getTime();
              }

              const cardBg = isPast ? "#F9FAFB" : isInRange ? "#E0F2FE" : (info.isAvailable ? "#F0FDF4" : "#FEE2E2");
              const cardBorder = isPast ? "1px solid #F3F4F6" : isInRange ? "2px solid #38BDF8" : (info.isAvailable ? "1px solid #86EFAC" : "1px solid #FCA5A5");
              const numColor = isPast ? "#D1D5DB" : isInRange ? "#0369A1" : (info.isAvailable ? "#166534" : "#991B1B");

              return (
                <div
                  key={dateStr}
                  onClick={() => !isPast && setSelectedDayDetails({ date, ...info })}
                  style={{ backgroundColor: cardBg, border: cardBorder, borderRadius: "12px", padding: "10px", minHeight: "80px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: isPast ? "default" : "pointer", transition: "transform 0.1s" }}
                  onMouseEnter={e => { if (!isPast) e.currentTarget.style.transform = "scale(1.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <div style={{ fontSize: "1.4rem", fontWeight: "900", color: numColor }}>{date.getDate()}</div>
                  {!isPast && (
                    <div style={{ fontSize: "0.65rem", fontWeight: "bold", color: numColor, marginTop: "4px", textTransform: "uppercase" }}>
                      {selectedCategory === "Barkada" && info.isAvailable
                        ? `${info.bedsLeft} beds`
                        : info.isAvailable
                        ? `${info.availableRooms.length} room${info.availableRooms.length !== 1 ? "s" : ""}`
                        : "Booked"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Day Details Modal */}
      <AnimatePresence>
        {selectedDayDetails && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
            onClick={() => setSelectedDayDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ backgroundColor: "#FFF", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", position: "relative" }}
            >
              <button
                onClick={() => setSelectedDayDetails(null)}
                style={{ position: "absolute", top: "20px", right: "20px", background: "#F3F4F6", border: "none", borderRadius: "50%", padding: "8px", cursor: "pointer", display: "flex", color: "#4B5563" }}
              >
                <X size={20} />
              </button>

              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: "800", color: "#0F172A" }}>
                {selectedDayDetails.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h3>
              <p style={{ margin: "0 0 24px 0", color: "#6B7280", fontSize: "0.95rem" }}>
                {activeCategoryLabel}
              </p>

              {!selectedDayDetails.isAvailable ? (
                <div style={{ padding: "20px", backgroundColor: "#FEE2E2", borderRadius: "12px", textAlign: "center", border: "1px solid #FCA5A5" }}>
                  <p style={{ margin: 0, color: "#991B1B", fontWeight: "bold", fontSize: "1.1rem" }}>Fully Booked</p>
                  <p style={{ margin: "6px 0 0 0", color: "#DC2626", fontSize: "0.85rem" }}>All rooms in this category are reserved for this date.</p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: "0 0 16px 0", color: "#166534", fontWeight: "bold", fontSize: "0.95rem" }}>
                    {selectedDayDetails.availableRooms.length} room{selectedDayDetails.availableRooms.length !== 1 ? "s" : ""} available
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {selectedDayDetails.availableRooms.map(room => (
                      <div key={room.id} style={{ padding: "14px 16px", backgroundColor: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontWeight: "bold", color: "#166534" }}>{room.name}</span>
                          <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: "#6B7280" }}>₱{Number(room.price).toLocaleString()}/night</span>
                        </div>
                        {selectedCategory === "Barkada" && (
                          <span style={{ backgroundColor: "#22C55E", color: "#FFF", padding: "3px 10px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: "bold" }}>
                            {selectedDayDetails.bedsLeft} beds
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => window.location.href = `/rooms`}
                    style={{ width: "100%", padding: "14px", marginTop: "20px", backgroundColor: "#F97316", color: "#000", border: "2px solid #000", borderRadius: "12px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 0 #000" }}
                  >
                    Book This Room
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
