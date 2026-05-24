import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Sun, User, Info, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { supabase, type Room, type Booking } from "../../../lib/supabase";

function toDateStr(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch rooms once
  useEffect(() => {
    supabase
      .from("rooms")
      .select("*")
      .order("id")
      .then(({ data, error }) => {
        if (!error && data) setRooms(data as Room[]);
        setLoadingRooms(false);
      });
  }, []);

  // Fetch bookings whenever visible month changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = toDateStr(new Date(year, month, 1));
    const lastDay = toDateStr(new Date(year, month + 1, 0));

    setLoadingBookings(true);
    supabase
      .from("bookings")
      .select("*, rooms(name, type, price)")
      .neq("status", "rejected")
      .lte("check_in", lastDay)
      .gte("check_out", firstDay)
      .then(({ data, error }) => {
        if (!error && data) setBookings(data as Booking[]);
        setLoadingBookings(false);
      });
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array(startDayOfWeek).fill(null);

  // For each day: bookings active on that day
  const dayBookings = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const day of monthDays) {
      const dateStr = toDateStr(day);
      map[dateStr] = bookings.filter(
        b => b.check_in <= dateStr && b.check_out > dateStr
      );
    }
    return map;
  }, [monthDays, bookings]);

  // Determine dot color per day based on how many rooms are booked
  function getDayStatus(dateStr: string) {
    const bookedIds = new Set(dayBookings[dateStr]?.map(b => b.room_id) ?? []);
    const totalRooms = rooms.length;
    const bookedCount = bookedIds.size;
    if (bookedCount === 0) return "available";
    if (bookedCount >= totalRooms) return "full";
    return "partial";
  }

  // Bookings and room status for the selected date
  const selectedDateStr = selectedDate ? toDateStr(selectedDate) : null;
  const selectedBookings = selectedDateStr ? (dayBookings[selectedDateStr] ?? []) : [];
  const bookedRoomIds = new Set(selectedBookings.map(b => b.room_id));

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const nights = (b: Booking) => {
    const diff = new Date(b.check_out).getTime() - new Date(b.check_in).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar Management</h1>
          <p className="text-gray-500 text-sm">Live room availability based on real bookings.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-bold text-lg min-w-[140px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-7 mb-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {loadingRooms || loadingBookings ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square bg-gray-50/50 rounded-lg" />
              ))}

              {monthDays.map((day, i) => {
                const dateStr = toDateStr(day);
                const status = getDayStatus(dateStr);
                const count = dayBookings[dateStr]?.length ?? 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                const statusColor =
                  status === "full"
                    ? "bg-red-50 border-red-200 hover:border-red-400"
                    : status === "partial"
                    ? "bg-orange-50 border-orange-200 hover:border-orange-400"
                    : "bg-green-50 border-green-100 hover:border-green-300";

                const dotColor =
                  status === "full" ? "bg-red-500" :
                  status === "partial" ? "bg-orange-500" : "bg-green-500";

                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDate(day)}
                    className={`relative aspect-square rounded-xl border-2 cursor-pointer transition-all p-2 flex flex-col justify-between ${
                      isSelected ? "ring-2 ring-black ring-offset-2 border-transparent bg-white" : statusColor
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-700">{format(day, "d")}</span>
                      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                    </div>
                    {count > 0 && (
                      <div className="mt-1">
                        <div className="bg-white/80 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-700 truncate border border-black/5 shadow-sm">
                          {count} Booking{count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-600">Partially Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Fully Booked</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-orange-500" />
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
          </h2>

          {selectedDate ? (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Room Status */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Room Status</h3>
                {loadingRooms ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" />
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {rooms.map(room => {
                      const isBooked = bookedRoomIds.has(room.id);
                      return (
                        <div key={room.id} className="flex justify-between text-sm border-b border-gray-200 pb-2">
                          <span className="text-gray-700">{room.name} <span className="text-xs text-gray-400">({room.type})</span></span>
                          <span className={`font-bold ${isBooked ? "text-red-500" : "text-green-600"}`}>
                            {isBooked ? "Booked" : "Available"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bookings for selected date */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
                  Active Stays ({selectedBookings.length})
                </h3>
                {selectedBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedBookings.map(booking => (
                      <div key={booking.id} className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-orange-200 p-1.5 rounded-full flex-shrink-0">
                            <User className="w-4 h-4 text-orange-800" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate">{booking.guest_name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {booking.rooms?.name ?? `Room #${booking.room_id}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="bg-white px-2 py-0.5 rounded text-gray-600 border border-gray-100">
                            {nights(booking)} night{nights(booking) !== 1 ? "s" : ""}
                          </span>
                          <span className={`font-bold uppercase ${
                            booking.status === "approved" ? "text-green-600" : "text-orange-500"
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {format(new Date(booking.check_in + "T00:00:00"), "MMM d")} → {format(new Date(booking.check_out + "T00:00:00"), "MMM d, yyyy")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-8">No active stays for this date.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <Sun className="w-12 h-12 mb-4 text-gray-200" />
              <p>Click on a date in the calendar to view room status and active bookings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
