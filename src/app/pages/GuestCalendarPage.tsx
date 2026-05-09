import { useState, useMemo, useRef } from "react";
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ROOMS = [
  { id: 1, name: "Room 1", type: "standard" },
  { id: 2, name: "Room 2", type: "standard" },
  { id: 3, name: "Room 3", type: "standard" },
  { id: 4, name: "Room 4", type: "standard" },
  { id: 5, name: "Room 5", type: "standard" },
  { id: 6, name: "Room 6", type: "family" },
  { id: 7, name: "Room 7", type: "standard" },
  { id: 8, name: "Room 8", type: "single" },
  { id: 9, name: "Room 9", type: "standard" },
  { id: 10, name: "Room 10", type: "barkada" },
  { id: 11, name: "Room 11", type: "family" },
];

const CATEGORIES = [
  { id: "barkada", label: "Barkada Room (8-Bed)" },
  { id: "standard", label: "Standard Rooms" },
  { id: "family", label: "Family Rooms" },
  { id: "single", label: "Single Room" },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function GuestCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); 
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [searchedRange, setSearchedRange] = useState<{start: Date, end: Date} | null>(null);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // State for the modal
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: Date;
    availableRooms: typeof ROOMS;
    isAvailable: boolean;
    bedsLeft: number;
  } | null>(null);

  const activeCategoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label;

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const availability = useMemo(() => {
    const grid: Record<string, { isAvailable: boolean; availableRooms: typeof ROOMS; bedsLeft: number }> = {};
    const categoryRooms = ROOMS.filter(r => r.type === selectedCategory);

    calendarDays.forEach(date => {
      if (!date) return;
      const dateStr = date.toISOString();
      
      const availableRooms = categoryRooms.filter(room => {
        // Generate pseudo-random availability based on room id and date
        const rand = Math.sin(room.id + date.getDate()) * 10000;
        return (rand - Math.floor(rand)) > 0.35; // 65% chance available
      });

      const isAvailable = availableRooms.length > 0;
      let bedsLeft = 0;

      if (selectedCategory === 'barkada' && isAvailable) {
        // Barkada pseudo-random beds calculation
        const rand = Math.sin(1 + date.getDate()) * 10000;
        bedsLeft = Math.floor((rand - Math.floor(rand)) * 8) + 1;
      }

      grid[dateStr] = { isAvailable, availableRooms, bedsLeft };
    });
    return grid;
  }, [calendarDays, selectedCategory]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div style={{ padding: '60px 20px', backgroundColor: '#FFFFFF', minHeight: 'calc(100vh - 64px)', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#0F172A', margin: '0 0 8px 0', fontWeight: '900' }}>Availability Calendar</h1>
            <p style={{ textAlign: 'center', color: '#6B7280', margin: 0, fontSize: '1.1rem' }}>
              Check real-time room availability. Green means open!
            </p>
          </div>

          {/* Room Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}>
            {CATEGORIES.map(category => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    border: isActive ? '2px solid #000000' : '2px solid #E5E7EB',
                    backgroundColor: isActive ? '#FACC15' : '#FFFFFF',
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: isActive ? '0 4px 10px rgba(250, 204, 21, 0.3)' : 'none'
                  }}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Date Selection */}
                    <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '24px',
            marginBottom: '40px',
            padding: '24px',
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
              <label htmlFor="check-in" style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-In Date</label>
              <input
                type="date"
                id="check-in"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '1rem',
                  fontWeight: '500',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  width: '100%'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
              <label htmlFor="check-out" style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-Out Date</label>
              <input
                type="date"
                id="check-out"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '1rem',
                  fontWeight: '500',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  width: '100%'
                }}
              />
            </div>

            <button
              onClick={() => {
                if (checkInDate && checkOutDate) {
                  const start = new Date(checkInDate);
                  const end = new Date(checkOutDate);
                  // Fix timezone offsets by doing this in UTC or just using the string parts.
                  // HTML date inputs are "YYYY-MM-DD"
                  const [inYear, inMonth, inDay] = checkInDate.split('-').map(Number);
                  const [outYear, outMonth, outDay] = checkOutDate.split('-').map(Number);
                  
                  setSearchedRange({
                    start: new Date(inYear, inMonth - 1, inDay),
                    end: new Date(outYear, outMonth - 1, outDay)
                  });
                  
                  // Scroll to calendar
                  setTimeout(() => {
                    calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }
              }}
              disabled={!checkInDate || !checkOutDate}
              style={{
                padding: '12px 32px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: (!checkInDate || !checkOutDate) ? '#E2E8F0' : '#000000',
                color: (!checkInDate || !checkOutDate) ? '#94A3B8' : '#FACC15',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: (!checkInDate || !checkOutDate) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                height: '48px',
                minWidth: '200px',
                boxShadow: (!checkInDate || !checkOutDate) ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                if (checkInDate && checkOutDate) {
                  e.currentTarget.style.backgroundColor = '#1E293B';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (checkInDate && checkOutDate) {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Check Availability
            </button>
          </div>

          {/* Month Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '32px' }}>
            <button 
              onClick={prevMonth}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#000' }}
            >
              <ChevronLeft size={36} />
            </button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', margin: 0, minWidth: '220px', textAlign: 'center' }}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button 
              onClick={nextMonth}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#000' }}
            >
              <ChevronRight size={36} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div ref={calendarRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px' }}>
            {/* Weekdays Header */}
            {WEEKDAYS.map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: '#9CA3AF', fontSize: '0.9rem', paddingBottom: '8px' }}>
                {day}
              </div>
            ))}

            {/* Days Grid */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ minHeight: '120px' }} />;
              }

              const dateStr = date.toISOString();
              const { isAvailable, availableRooms, bedsLeft } = availability[dateStr];

              // Check if date is within selected range
              let isInRange = false;
              if (searchedRange) {
                // Remove time component for accurate comparison
                const currentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                const startDay = searchedRange.start.getTime();
                const endDay = searchedRange.end.getTime();
                isInRange = currentDay >= startDay && currentDay <= endDay;
              }

              const cardBg = isInRange ? '#E0F2FE' : (isAvailable ? '#F0FDF4' : '#FEE2E2');
              const cardBorder = isInRange ? '2px solid #38BDF8' : (isAvailable ? '1px solid #86EFAC' : '1px solid #FCA5A5');
              const numColor = isInRange ? '#0369A1' : (isAvailable ? '#166534' : '#991B1B');
              const textColor = isInRange ? '#0284C7' : (isAvailable ? '#22C55E' : '#DC2626');

              let statusText = "";
              if (selectedCategory === 'barkada') {
                statusText = isAvailable ? `${bedsLeft} Beds Left` : "Booked";
              }

              return (
                <div 
                  key={dateStr}
                  onClick={() => setSelectedDayDetails({ date, availableRooms, isAvailable, bedsLeft })}
                  style={{
                    backgroundColor: cardBg,
                    border: cardBorder,
                    borderRadius: '16px',
                    padding: '16px',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', color: numColor, lineHeight: 1 }}>
                    {date.getDate()}
                  </div>
                  
                  {statusText && (
                    <>
                      {statusText !== 'Booked' && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '0.95rem', 
                          fontWeight: 'bold', 
                          color: textColor, 
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {statusText}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Modal / Popup for Daily Details */}
      <AnimatePresence>
        {selectedDayDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setSelectedDayDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSelectedDayDetails(null)}
                style={{
                  position: 'absolute',
                  top: '20px', right: '20px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '50%',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563'
                }}
              >
                <X size={20} />
              </button>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#0F172A', fontWeight: '800' }}>
                {selectedDayDetails.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p style={{ margin: '0 0 24px 0', color: '#6B7280', fontSize: '1rem', fontWeight: '500' }}>
                {activeCategoryLabel} Availability
              </p>

              {!selectedDayDetails.isAvailable ? (
                <div style={{ padding: '24px', backgroundColor: '#FEE2E2', borderRadius: '12px', textAlign: 'center', border: '1px solid #FCA5A5' }}>
                  <p style={{ margin: 0, color: '#991B1B', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Fully Booked
                  </p>
                  <p style={{ margin: '8px 0 0 0', color: '#DC2626', fontSize: '0.9rem' }}>
                    There are no rooms available in this category for this date.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedDayDetails.availableRooms.map(room => (
                      <div key={room.id} style={{
                        padding: '16px',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #86EFAC',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.1rem' }}>
                          {room.name}
                        </span>
                        {selectedCategory === 'barkada' && (
                          <span style={{ backgroundColor: '#22C55E', color: '#FFF', padding: '4px 12px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            {selectedDayDetails.bedsLeft} Beds Left
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '16px',
                    marginTop: '24px',
                    backgroundColor: '#FACC15',
                    color: '#000',
                    border: '2px solid #000',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #000',
                    transition: 'transform 0.1s, box-shadow 0.1s'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(4px)';
                    e.currentTarget.style.boxShadow = '0 0px 0 #000';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 0 #000';
                  }}
                  >
                    Proceed to Booking
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
