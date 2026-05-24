import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react";

// Mock Data
const REVENUE_DATA = [
  { name: 'Jan', value: 125000 },
  { name: 'Feb', value: 158000 },
  { name: 'Mar', value: 205000 },
  { name: 'Apr', value: 185000 },
  { name: 'May', value: 240000 },
  { name: 'Jun', value: 210000 },
];

const OCCUPANCY_DATA = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 48 },
  { name: 'Thu', value: 65 },
  { name: 'Fri', value: 85 },
  { name: 'Sat', value: 92 },
  { name: 'Sun', value: 78 },
];

const SOURCE_DATA = [
  { name: 'Direct', value: 400 },
  { name: 'Agoda', value: 300 },
  { name: 'Booking.com', value: 300 },
  { name: 'Airbnb', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
          <p className="text-gray-500 text-sm">Analyze performance and growth metrics.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-black">Last 30 Days</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900">Last 90 Days</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900">YTD</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₱1,245,300</h3>
            <span className="text-green-600 text-xs font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +15% vs last month
            </span>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Bookings</p>
            <h3 className="text-2xl font-bold text-gray-900">342</h3>
            <span className="text-green-600 text-xs font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +8% vs last month
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Occupancy</p>
            <h3 className="text-2xl font-bold text-gray-900">78%</h3>
            <span className="text-red-500 text-xs font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 rotate-180" /> -2% vs last month
            </span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">RevPAR</p>
            <h3 className="text-2xl font-bold text-gray-900">₱1,850</h3>
            <span className="text-green-600 text-xs font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +5% vs last month
            </span>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend (Monthly)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Occupancy Rate (Weekly)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={OCCUPANCY_DATA}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#000000" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
