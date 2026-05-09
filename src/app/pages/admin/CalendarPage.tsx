import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay 
} from "date-fns";
import { ChevronLeft, ChevronRight, Sun, User, Info } from "lucide-react";
import { motion } from "motion/react";

// Mock data for bookings
const BOOKINGS = [
  { id: 1, guest: "Maria Santos", room: "Private Queen A", date: "2024-02-28", nights: 2, status: "confirmed" },
  { id: 2, guest: "John Doe", room: "Dorm Bed 1", date: "2024-02-28", nights: 3, status: "confirmed" },
  { id: 3, guest: "Sarah Lee", room: "Family Suite", date: "2024-03-05", nights: 1, status: "pending" },
];

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate empty days for start of month grid
  const startDay = getDay(monthStart);
  const emptyDays = Array(startDay).fill(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getBookingsForDate = (date: Date) => {
    return BOOKINGS.filter(b => isSameDay(new Date(b.date), date));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar Management</h1>
          <p className="text-gray-500 text-sm">Manage room availability and view bookings.</p>
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
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-gray-50/50 rounded-lg" />
            ))}
            
            {monthDays.map((day, i) => {
              const bookings = getBookingsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const dayNum = parseInt(format(day, 'd'));
              
              // Mock status logic
              let statusColor = "bg-green-50 border-green-100 hover:border-green-300";
              let statusDot = "bg-green-500";
              
              if (bookings.length > 0) {
                statusColor = "bg-yellow-50 border-yellow-100 hover:border-yellow-300";
                statusDot = "bg-yellow-500";
              }
              if (dayNum === 15 || dayNum === 16) { // Mock fully booked dates
                statusColor = "bg-red-50 border-red-100 hover:border-red-300";
                statusDot = "bg-red-500";
              }

              return (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedDate(day)}
                  className={`relative aspect-square rounded-xl border-2 cursor-pointer transition-all p-2 flex flex-col justify-between ${isSelected ? 'ring-2 ring-black ring-offset-2 border-transparent' : statusColor}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                      {format(day, "d")}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${statusDot}`} />
                  </div>
                  
                  {bookings.length > 0 && (
                    <div className="mt-1">
                      <div className="bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-800 truncate border border-black/5 shadow-sm">
                        {bookings.length} Booking{bookings.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-gray-600">Limited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600">Fully Booked</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-yellow-500" />
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
          </h2>

          {selectedDate ? (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Room Status</h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 1 (Standard)</span>
                    <span className="font-bold text-red-500">Booked</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 2 (Standard)</span>
                    <span className="font-bold text-green-600">Available</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 3 (Standard)</span>
                    <span className="font-bold text-green-600">Available</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 4 (Standard)</span>
                    <span className="font-bold text-red-500">Booked</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 5 (Standard)</span>
                    <span className="font-bold text-green-600">Available</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 6 (Family)</span>
                    <span className="font-bold text-green-600">Available</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 7 (Standard)</span>
                    <span className="font-bold text-green-600">Available</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 8 (Single)</span>
                    <span className="font-bold text-green-600">Available</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 9 (Standard)</span>
                    <span className="font-bold text-green-600">Available</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                    <span>Room 10 (Barkada)</span>
                    <span className="font-bold text-green-600">4 Beds Left</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Room 11 (Family)</span>
                    <span className="font-bold text-green-600">Available</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                   <button className="w-full text-xs font-bold text-black border border-black py-2 rounded-lg hover:bg-black hover:text-white transition-colors">
                     Block Date (Mark Full)
                   </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Bookings</h3>
                {getBookingsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getBookingsForDate(selectedDate).map((booking, i) => (
                      <div key={i} className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-yellow-200 p-1.5 rounded-full">
                            <User className="w-4 h-4 text-yellow-800" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{booking.guest}</p>
                            <p className="text-xs text-gray-500">{booking.room}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="bg-white px-2 py-0.5 rounded text-gray-600 border border-gray-100">{booking.nights} Nights</span>
                           <span className="font-bold text-green-600 uppercase">{booking.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-8">No bookings for this date yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <Sun className="w-12 h-12 mb-4 text-gray-200" />
              <p>Click on a date in the calendar to view details, bookings, and manage availability.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
