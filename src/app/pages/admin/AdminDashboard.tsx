import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreHorizontal, 
  Utensils 
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays } from "date-fns";
import { clsx } from "clsx";

const MOCK_STATS = [
  { label: "Daily Sales", value: "₱12,450", trend: "+15%", icon: DollarSign, color: "bg-green-100 text-green-600" },
  { label: "Monthly Revenue", value: "₱345,200", trend: "+8%", icon: BarChart, color: "bg-blue-100 text-blue-600" },
  { label: "Occupancy Rate", value: "78%", trend: "-2%", icon: Users, color: "bg-purple-100 text-purple-600" },
  { label: "Pending Payments", value: "3", trend: "Action Needed", icon: Clock, color: "bg-yellow-100 text-yellow-600" },
];

const MOCK_PAYMENTS = [
  { id: 1, guest: "Maria Santos", amount: 3500, date: "2024-02-28", status: "Pending", proof: "https://via.placeholder.com/50" },
  { id: 2, guest: "John Doe", amount: 1200, date: "2024-02-27", status: "Approved", proof: "https://via.placeholder.com/50" },
  { id: 3, guest: "Sarah Lee", amount: 4500, date: "2024-02-26", status: "Rejected", proof: "https://via.placeholder.com/50" },
];

const MOCK_KITCHEN = [
  { id: 1, guest: "Room 101", item: "Filipino Breakfast", qty: 2, time: "08:00 AM" },
  { id: 2, guest: "Dorm Bed 3", item: "Pancakes", qty: 1, time: "09:00 AM" },
];

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: {format(new Date(), "MMM dd, yyyy HH:mm")}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_STATS.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.includes('+') ? 'bg-green-50 text-green-600' : stat.trend.includes('-') ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[600px] mb-8">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-lg font-bold">Room Schedule</h2>
      <p className="text-sm text-gray-500 mt-1">Viewing all 11 rooms across 3 floors</p>
    </div>
    <div className="flex gap-4 text-xs bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span> Confirmed</span>
      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></span> Pending</span>
      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-100 border border-green-300"></span> Available</span>
    </div>
  </div>
  
  <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
    {/* Timeline Header (Days) */}
    <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
      <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 bg-gray-50 p-3 flex items-center">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Room</span>
      </div>
      <div className="flex-1 flex min-w-[800px]">
        {Array.from({length: 14}).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i - 2); // Start 2 days ago
          const isToday = i === 2;
          
          return (
            <div key={i} className={`flex-1 min-w-0 border-r border-gray-200 flex flex-col items-center py-2 ${isToday ? 'bg-blue-50/50' : ''}`}>
              <span className="text-[10px] text-gray-500 uppercase">{format(date, 'EEE')}</span>
              <span className={`text-sm font-bold mt-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                {format(date, 'd')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
    
    {/* Timeline Body (Rooms) */}
    <div className="flex-1 overflow-x-auto custom-scrollbar">
      <div className="min-w-[800px] flex flex-col relative pb-4">
        
        {/* Floor 1 */}
        <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 border-b border-gray-200 sticky left-0 z-10">
          Ground Floor
        </div>
        
        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 1</span>
            <span className="text-xs text-gray-500">8 Bed Dorm (Mixed)</span>
          </div>
          <div className="flex-1 relative flex">
            {/* Grid lines */}
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
            
            {/* Booking Blocks */}
            <div className="absolute top-2 bottom-2 left-[14.28%] w-[21.42%] px-1">
              <div className="h-full bg-blue-100 border border-blue-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                John D. (2 beds)
              </div>
            </div>
            <div className="absolute top-2 bottom-2 left-[50%] w-[14.28%] px-1">
              <div className="h-full bg-yellow-100 border border-yellow-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-yellow-800 cursor-pointer hover:bg-yellow-200 transition-colors">
                Pending (4 beds)
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 2</span>
            <span className="text-xs text-gray-500">Private Queen</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
            
            <div className="absolute top-2 bottom-2 left-0 w-[28.56%] px-1">
              <div className="h-full bg-blue-100 border border-blue-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                Sarah L.
              </div>
            </div>
            <div className="absolute top-2 bottom-2 left-[42.84%] w-[35.7%] px-1">
              <div className="h-full bg-blue-100 border border-blue-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                Mike T.
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 3</span>
            <span className="text-xs text-gray-500">Private Queen</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
          </div>
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 4</span>
            <span className="text-xs text-gray-500">Private Queen</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
            
            <div className="absolute top-2 bottom-2 left-[21.42%] w-[21.42%] px-1">
              <div className="h-full bg-red-100 border border-red-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-red-800 cursor-pointer hover:bg-red-200 transition-colors">
                AC Maintenance
              </div>
            </div>
          </div>
        </div>

        {/* Floor 2 */}
        <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 border-b border-gray-200 sticky left-0 z-10 mt-2">
          Second Floor
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 5</span>
            <span className="text-xs text-gray-500">Private Queen</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
          </div>
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 6</span>
            <span className="text-xs text-gray-500">Family Suite</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
            
            <div className="absolute top-2 bottom-2 left-[7.14%] w-[42.84%] px-1">
              <div className="h-full bg-blue-100 border border-blue-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                Perez Family (5 pax)
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 7</span>
            <span className="text-xs text-gray-500">Private Queen</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
          </div>
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 8</span>
            <span className="text-xs text-gray-500">Private Queen</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
            <div className="absolute top-2 bottom-2 left-[50%] w-[35.7%] px-1">
              <div className="h-full bg-blue-100 border border-blue-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                Ana R.
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 9</span>
            <span className="text-xs text-gray-500">Private Queen</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
            <div className="absolute top-2 bottom-2 left-[0%] w-[42.84%] px-1">
              <div className="h-full bg-blue-100 border border-blue-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                Ken P.
              </div>
            </div>
          </div>
        </div>

        {/* Floor 3 */}
        <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 border-b border-gray-200 sticky left-0 z-10 mt-2">
          Third Floor
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 10</span>
            <span className="text-xs text-gray-500">Family Suite</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
          </div>
        </div>

        <div className="flex border-b border-gray-100 group hover:bg-gray-50">
          <div className="w-32 md:w-48 shrink-0 border-r border-gray-200 p-3 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex flex-col justify-center">
            <span className="font-bold text-sm">Room 11</span>
            <span className="text-xs text-gray-500">8 Bed Dorm (Female)</span>
          </div>
          <div className="flex-1 relative flex">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className={`flex-1 border-r border-gray-100 ${i === 2 ? 'bg-blue-50/20' : ''}`}></div>
            ))}
            <div className="absolute top-2 bottom-2 left-[7.14%] w-[14.28%] px-1">
              <div className="h-full bg-blue-100 border border-blue-300 rounded-md flex items-center px-2 shadow-sm truncate text-xs text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                Tom W. (Checkout)
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>


    </div>
  );
}



// Helper icon
function LogOutIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
