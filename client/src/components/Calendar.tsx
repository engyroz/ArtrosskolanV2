import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, ChevronUp, Dumbbell, Heart, Check, Coffee, Activity } from 'lucide-react';
import { 
  toLocalISOString, 
  isSameDay, 
  getWeekDays, 
  getDaysInMonthGrid, 
  SWEDISH_MONTHS, 
  SWEDISH_DAYS_SHORT,
  addMonths
} from '../utils/dateHelpers';

export interface CalendarMarker {
  date: string; // YYYY-MM-DD
  color: string;
  type: 'filled' | 'hollow' | 'cross'; 
  iconType?: 'rehab' | 'activity' | 'rest'; // For Week View icons
}

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  markers: CalendarMarker[];
  currentDate: Date;
}

const Calendar = ({ selectedDate, onSelectDate, currentMonth, onMonthChange, markers, currentDate }: CalendarProps) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week'); 

  const toggleView = () => {
    setViewMode(prev => prev === 'week' ? 'month' : 'week');
  };

  const renderWeekIcon = (marker: CalendarMarker | undefined, isToday: boolean) => {
    const defaultIconColor = isToday ? 'text-white/80' : 'text-slate-300';

    // 1. No marker -> Assume Rest if no explicit logic, or just empty
    if (!marker) {
        // Optional: Logic to show Coffee cup if explicitly a rest day, but marker data drives this.
        // If we want to show Coffee for empty days, we need a 'rest' marker type.
        // Assuming 'markers' includes all relevant status info.
        return <div className="h-4 w-4" />;
    }

    // 2. Completed (Filled) -> Colored Circle with Check
    if (marker.type === 'filled') {
        return (
            <div 
                className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: marker.color }}
            >
                <Check size={14} className="text-white" strokeWidth={3} />
            </div>
        );
    }
    
    // 3. Planned / Missed (Hollow/Cross) -> Specific Icons
    const iconColor = isToday ? 'text-white' : marker.color === '#CBD5E1' ? 'text-slate-400' : marker.color; // Use slate for planned, red/color for missed
    
    if (marker.iconType === 'rehab') {
         return <Dumbbell size={20} className={iconColor} strokeWidth={2} />;
    }
    if (marker.iconType === 'activity') {
         // Shoe isn't in Lucide basic set usually, Activity/Heart works
         return <Activity size={20} className={iconColor} strokeWidth={2} />;
    }
    if (marker.iconType === 'rest') {
        return <Coffee size={18} className={iconColor} strokeWidth={2} />;
    }
    
    return <div className="h-4 w-4" />;
  };

  const renderMonthDot = (marker: CalendarMarker) => {
      // Completed -> Large Filled Dot
      if (marker.type === 'filled') {
          return (
              <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: marker.color }} 
              />
          );
      }
      // Planned -> Large Hollow Ring
      return (
          <div 
              className="w-2 h-2 rounded-full border-2 bg-transparent"
              style={{ borderColor: marker.color }} 
          />
      );
  };

  const renderDayCell = (date: Date, isCurrentMonth = true) => {
    const dateStr = toLocalISOString(date);
    const isSelected = isSameDay(date, selectedDate);
    const isToday = isSameDay(date, currentDate);
    
    const marker = markers.find(m => m.date === dateStr);

    // --- WEEK VIEW STYLING (Vertical Pill) ---
    if (viewMode === 'week') {
        let pillClasses = "relative w-14 h-28 flex flex-col items-center justify-between py-3 rounded-full transition-all cursor-pointer select-none border";
        
        if (isToday) {
            // Solid Blue for Today
            pillClasses += " bg-blue-600 border-blue-600 text-white shadow-lg transform scale-105 z-10";
        } else if (isSelected) {
            // Selected but not today (Ring)
            pillClasses += " bg-white border-blue-600 text-slate-900 ring-2 ring-blue-600 z-10";
        } else {
            // Standard Day
            pillClasses += " bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-slate-50";
        }

        return (
            <div key={dateStr} className="flex flex-col items-center justify-center px-0.5">
                <div onClick={() => onSelectDate(date)} className={pillClasses}>
                    {/* Top: Day Name */}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>
                        {SWEDISH_DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                    </span>
                    
                    {/* Middle: Date Number */}
                    <span className="text-2xl font-bold leading-none">{date.getDate()}</span>
                    
                    {/* Bottom: Icon */}
                    <div className="h-8 flex items-center justify-center">
                        {renderWeekIcon(marker, isToday)}
                    </div>
                </div>
            </div>
        );
    }

    // --- MONTH VIEW STYLING (Clean Grid) ---
    let cellClasses = "relative w-full aspect-square flex flex-col items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer select-none";
    
    if (isSelected) {
      cellClasses += " bg-slate-900 text-white shadow-md z-10";
    } else if (isToday) {
      cellClasses += " text-blue-600 font-bold bg-blue-50";
    } else {
      cellClasses += " text-slate-700 hover:bg-slate-50";
    }

    if (!isCurrentMonth) {
      cellClasses += " opacity-20";
    }

    return (
      <div key={dateStr} className="flex items-center justify-center p-1">
        <div onClick={() => onSelectDate(date)} className={cellClasses}>
          <span>{date.getDate()}</span>
          
          {/* Month Marker */}
          {marker && (
            <div className="absolute bottom-1.5">
               {renderMonthDot(marker)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const displayedDays = viewMode === 'week' 
    ? getWeekDays(selectedDate) 
    : getDaysInMonthGrid(currentMonth);

  return (
    <div className="bg-white rounded-b-3xl shadow-sm border-b border-slate-200 overflow-hidden">
      
      {/* Header / Month Navigator */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h2 className="text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
          {SWEDISH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        {viewMode === 'month' && (
            <div className="flex items-center gap-2">
                <button onClick={() => onMonthChange(addMonths(currentMonth, -1))} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => onMonthChange(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-2 pb-6">
        {/* Days Header for Month View Only */}
        {viewMode === 'month' && (
            <div className="grid grid-cols-7 mb-2">
            {SWEDISH_DAYS_SHORT.map((day, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-slate-400">
                {day}
                </div>
            ))}
            </div>
        )}

        <div className={`grid grid-cols-7 ${viewMode === 'week' ? 'gap-1' : 'gap-1'} transition-all duration-300`}>
          {displayedDays.map(date => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            return renderDayCell(date, isCurrentMonth);
          })}
        </div>
      </div>

      {/* Expand/Collapse Handle */}
      <button 
        onClick={toggleView}
        className="w-full py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider"
      >
        {viewMode === 'week' ? (
            <>Visa Månad <ChevronDown className="w-3 h-3 ml-1" /></>
        ) : (
            <>Visa Vecka <ChevronUp className="w-3 h-3 ml-1" /></>
        )}
      </button>
    </div>
  );
};

export default Calendar;