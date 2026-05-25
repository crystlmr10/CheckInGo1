import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  format, subDays, startOfYear, startOfMonth, endOfMonth,
  eachMonthOfInterval, eachDayOfInterval, differenceInDays,
} from "date-fns";
import { DollarSign, Users, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { supabase, type Room } from "../../../lib/supabase";

type Period = "30d" | "90d" | "ytd";

type BookingRow = {
  id: string;
  room_id: number;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: string;
  rooms?: { type: string } | null;
};

const TYPE_COLORS = ["#000000", "#f97316", "#3b82f6", "#8b5cf6", "#10b981"];

export function ReportsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [allBookings, setAllBookings] = useState<BookingRow[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: bData }, { data: rData }] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, room_id, check_in, check_out, total_amount, status, rooms(type)")
          .neq("status", "rejected")
          .order("check_in", { ascending: true }),
        supabase.from("rooms").select("*"),
      ]);
      setAllBookings((bData as unknown as BookingRow[]) || []);
      setRooms((rData as Room[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const { startDate, endDate, startStr, endStr } = useMemo(() => {
    let start: Date;
    if (period === "30d") start = subDays(today, 29);
    else if (period === "90d") start = subDays(today, 89);
    else start = startOfYear(today);
    return {
      startDate: start,
      endDate: today,
      startStr: format(start, "yyyy-MM-dd"),
      endStr: format(today, "yyyy-MM-dd"),
    };
  }, [period, today]);

  // Bookings with check_in inside the selected period
  const periodBookings = useMemo(
    () => allBookings.filter(b => b.check_in >= startStr && b.check_in <= endStr),
    [allBookings, startStr, endStr]
  );
  const approvedPeriod = useMemo(
    () => periodBookings.filter(b => b.status === "approved"),
    [periodBookings]
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalRevenue = useMemo(
    () => approvedPeriod.reduce((sum, b) => sum + Number(b.total_amount), 0),
    [approvedPeriod]
  );

  const totalBookings = periodBookings.length;

  const avgOccupancy = useMemo(() => {
    if (rooms.length === 0) return 0;
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const rates = days.map(day => {
      const ds = format(day, "yyyy-MM-dd");
      const occupied = allBookings.filter(b => b.check_in <= ds && b.check_out > ds).length;
      return (occupied / rooms.length) * 100;
    });
    return Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
  }, [allBookings, rooms, startDate, endDate]);

  const dayCount = differenceInDays(endDate, startDate) + 1;
  const revPAR =
    rooms.length > 0 && dayCount > 0 && totalRevenue > 0
      ? Math.round(totalRevenue / (rooms.length * dayCount))
      : 0;

  // ── Charts ─────────────────────────────────────────────────────────────────
  const revenueByMonth = useMemo(() => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    return months.map(month => ({
      name: format(month, "MMM"),
      value: approvedPeriod
        .filter(b => {
          const mStart = format(startOfMonth(month), "yyyy-MM-dd");
          const mEnd = format(endOfMonth(month), "yyyy-MM-dd");
          return b.check_in >= mStart && b.check_in <= mEnd;
        })
        .reduce((sum, b) => sum + Number(b.total_amount), 0),
    }));
  }, [approvedPeriod, startDate, endDate]);

  const occupancyByDay = useMemo(() => {
    if (rooms.length === 0) return [];
    return eachDayOfInterval({ start: subDays(today, 6), end: today }).map(day => {
      const ds = format(day, "yyyy-MM-dd");
      const occupied = allBookings.filter(b => b.check_in <= ds && b.check_out > ds).length;
      return { name: format(day, "EEE"), value: Math.round((occupied / rooms.length) * 100) };
    });
  }, [allBookings, rooms, today]);

  const bookingsByType = useMemo(() => {
    const map: Record<string, { bookings: number; revenue: number }> = {};
    for (const b of approvedPeriod) {
      const type = b.rooms?.type || "Unknown";
      if (!map[type]) map[type] = { bookings: 0, revenue: 0 };
      map[type].bookings++;
      map[type].revenue += Number(b.total_amount);
    }
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [approvedPeriod]);

  const kpis = [
    {
      label: "Total Revenue",
      value: `₱${totalRevenue.toLocaleString()}`,
      sub: period === "30d" ? "Last 30 days" : period === "90d" ? "Last 90 days" : "Year to date",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Bookings",
      value: String(totalBookings),
      sub: "Pending + approved",
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg. Occupancy",
      value: `${avgOccupancy}%`,
      sub: "Daily average for period",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "RevPAR",
      value: `₱${revPAR.toLocaleString()}`,
      sub: "Revenue per available room/night",
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
          <p className="text-gray-500 text-sm">Live data · last updated {format(new Date(), "MMM dd, yyyy HH:mm")}</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(["30d", "90d", "ytd"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {p === "30d" ? "Last 30 Days" : p === "90d" ? "Last 90 Days" : "YTD"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map(k => (
              <div
                key={k.label}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{k.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{k.value}</h3>
                  <span className="text-gray-400 text-xs mt-1 block">{k.sub}</span>
                </div>
                <div className={`p-3 rounded-xl ${k.color}`}>
                  <k.icon className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue trend */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Revenue Trend</h3>
              <p className="text-xs text-gray-400 mb-6">Approved bookings by month</p>
              {revenueByMonth.every(m => m.value === 0) ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  No approved bookings in this period.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByMonth}>
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={v => v >= 1000 ? `₱${Math.round(v / 1000)}k` : `₱${v}`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)" }}
                        formatter={(value: number) => [`₱${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Occupancy last 7 days */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Occupancy Rate</h3>
              <p className="text-xs text-gray-400 mb-6">Last 7 days · {rooms.length} rooms total</p>
              {occupancyByDay.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No room data.</div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={occupancyByDay}>
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={v => `${v}%`}
                      />
                      <Tooltip
                        cursor={{ fill: "#f3f4f6" }}
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)" }}
                        formatter={(value: number) => [`${value}%`, "Occupancy"]}
                      />
                      <Bar dataKey="value" fill="#000000" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Room type breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Revenue by Room Type</h3>
              <p className="text-xs text-gray-400 mt-0.5">Approved bookings in selected period</p>
            </div>
            {bookingsByType.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No approved bookings in this period.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    {["Room Type", "Bookings", "Revenue", "Share"].map(h => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookingsByType.map((row, i) => (
                    <tr key={row.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }}
                          />
                          <span className="font-semibold text-gray-800">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.bookings}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">₱{row.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0}%`,
                                backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">
                            {totalRevenue > 0 ? Math.round((row.revenue / totalRevenue) * 100) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
