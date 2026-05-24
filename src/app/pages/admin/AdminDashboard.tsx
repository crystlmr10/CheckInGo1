import { useState, useEffect, useMemo } from "react";
import {
  format,
  addDays,
  differenceInDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Users, DollarSign, Clock, Loader2, TrendingUp } from "lucide-react";
import { supabase, type Room, type Booking } from "../../../lib/supabase";

const DAYS = 14;
const DAY_COL_PCT = 100 / DAYS;

function toDateStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function getBlockStyle(checkIn: string, checkOut: string, windowStart: Date) {
  const inDate = new Date(checkIn + "T00:00:00");
  const outDate = new Date(checkOut + "T00:00:00");
  const startOffset = Math.max(0, differenceInDays(inDate, windowStart));
  const endOffset = Math.min(DAYS, differenceInDays(outDate, windowStart));
  const widthDays = endOffset - startOffset;
  if (widthDays <= 0) return null;
  return {
    left: `${startOffset * DAY_COL_PCT}%`,
    width: `${widthDays * DAY_COL_PCT}%`,
  };
}

export function AdminDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scheduleBookings, setScheduleBookings] = useState<Booking[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const today = useMemo(() => new Date(), []);
  const windowStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today]);

  const windowDays = useMemo(() =>
    Array.from({ length: DAYS }, (_, i) => addDays(windowStart, i)),
    [windowStart]
  );

  useEffect(() => {
    // Fetch rooms
    supabase.from("rooms").select("*").order("id").then(({ data }) => {
      if (data) setRooms(data as Room[]);
      setLoadingRooms(false);
    });

    // Fetch schedule bookings (14-day window)
    const winStart = toDateStr(windowStart);
    const winEnd = toDateStr(addDays(windowStart, DAYS - 1));
    supabase
      .from("bookings")
      .select("*, rooms(name, type)")
      .neq("status", "rejected")
      .lte("check_in", winEnd)
      .gte("check_out", winStart)
      .then(({ data }) => {
        if (data) setScheduleBookings(data as Booking[]);
        setLoadingBookings(false);
      });

    // Pending count
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setPendingCount(count ?? 0));

    // Monthly revenue (approved bookings this month)
    const monthStart = toDateStr(startOfMonth(today));
    const monthEnd = toDateStr(endOfMonth(today));
    supabase
      .from("bookings")
      .select("total_amount")
      .eq("status", "approved")
      .gte("check_in", monthStart)
      .lte("check_in", monthEnd)
      .then(({ data }) => {
        if (data) setMonthlyRevenue(data.reduce((sum, b) => sum + Number(b.total_amount), 0));
      });
  }, []);

  // Occupancy: rooms booked today
  const todayStr = toDateStr(today);
  const bookedTodayIds = new Set(
    scheduleBookings
      .filter(b => b.check_in <= todayStr && b.check_out > todayStr)
      .map(b => b.room_id)
  );
  const occupancyPct = rooms.length > 0
    ? Math.round((bookedTodayIds.size / rooms.length) * 100)
    : 0;

  // Group rooms by floor
  const roomsByFloor = useMemo(() => {
    const map: Record<string, Room[]> = {};
    for (const room of rooms) {
      const floor = room.floor ?? "Other";
      if (!map[floor]) map[floor] = [];
      map[floor].push(room);
    }
    return map;
  }, [rooms]);

  const stats = [
    {
      label: "Monthly Revenue",
      value: `₱${monthlyRevenue.toLocaleString()}`,
      sub: "Approved this month",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Occupancy Today",
      value: `${occupancyPct}%`,
      sub: `${bookedTodayIds.size} of ${rooms.length} rooms`,
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Bookings",
      value: String(bookedTodayIds.size),
      sub: "Rooms occupied today",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Pending Payments",
      value: String(pendingCount),
      sub: "Awaiting review",
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Room Schedule */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold">Room Schedule</h2>
            <p className="text-sm text-gray-500 mt-1">
              {rooms.length} rooms · 14-day live view
            </p>
          </div>
          <div className="flex gap-4 text-xs bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /> Confirmed
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-orange-100 border border-orange-300" /> Pending
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Available
            </span>
          </div>
        </div>

        {loadingRooms || loadingBookings ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden">
            {/* Header row */}
            <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
              <div className="w-36 md:w-48 shrink-0 border-r border-gray-200 p-3 flex items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Room</span>
              </div>
              <div className="flex-1 flex overflow-x-auto">
                <div className="flex min-w-[700px] flex-1">
                  {windowDays.map((date, i) => {
                    const isToday = toDateStr(date) === todayStr;
                    return (
                      <div
                        key={i}
                        style={{ width: `${DAY_COL_PCT}%`, flexShrink: 0 }}
                        className={`border-r border-gray-200 flex flex-col items-center py-2 ${isToday ? "bg-blue-50" : ""}`}
                      >
                        <span className="text-[10px] text-gray-400 uppercase">{format(date, "EEE")}</span>
                        <span className={`text-sm font-bold mt-0.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white" : "text-gray-700"}`}>
                          {format(date, "d")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Room rows grouped by floor */}
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
                  <div key={floor}>
                    {/* Floor label */}
                    <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 border-b border-gray-200">
                      {floor}
                    </div>

                    {floorRooms.map(room => {
                      const roomBookings = scheduleBookings.filter(b => b.room_id === room.id);
                      return (
                        <div key={room.id} className="flex border-b border-gray-100 group hover:bg-gray-50 min-h-[52px]">
                          {/* Room label */}
                          <div className="w-36 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
                            <span className="font-bold text-sm text-gray-800 truncate">{room.name}</span>
                            <span className="text-xs text-gray-400 truncate">{room.type}</span>
                          </div>

                          {/* Timeline */}
                          <div className="flex-1 relative flex">
                            {/* Day grid lines */}
                            {windowDays.map((date, i) => {
                              const isToday = toDateStr(date) === todayStr;
                              return (
                                <div
                                  key={i}
                                  style={{ width: `${DAY_COL_PCT}%`, flexShrink: 0 }}
                                  className={`h-full border-r border-gray-100 ${isToday ? "bg-blue-50/20" : ""}`}
                                />
                              );
                            })}

                            {/* Booking blocks */}
                            {roomBookings.map(booking => {
                              const style = getBlockStyle(booking.check_in, booking.check_out, windowStart);
                              if (!style) return null;
                              const isApproved = booking.status === "approved";
                              return (
                                <div
                                  key={booking.id}
                                  className="absolute top-2 bottom-2 px-1"
                                  style={style}
                                >
                                  <div className={`h-full rounded-md flex items-center px-2 shadow-sm text-xs font-medium truncate cursor-pointer transition-colors ${
                                    isApproved
                                      ? "bg-blue-100 border border-blue-300 text-blue-800 hover:bg-blue-200"
                                      : "bg-orange-100 border border-orange-300 text-orange-800 hover:bg-orange-200"
                                  }`}>
                                    {booking.guest_name}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
