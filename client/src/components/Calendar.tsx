import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Maximize2, Minimize2 } from 'lucide-react';
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
  type: 'filled' | 'hollow' | 'cross'; // Added 'cross' for missed
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
  // We can keep viewMode local as it doesn't affect data fetching requirements usually
  const [viewMode, setViewMode] = React.useState<'week' | 'month'>('month'); 

  const renderDayCell = (date: Date, isCurrentMonth = true) => {
    const dateStr = toLocalISOString(date);
    const isSelected = isSameDay(date, selectedDate);
    const isToday = isSameDay(date, currentDate);
    
    const marker = markers.find(m => m.date === dateStr);

    let cellClasses = "relative w-10 h-10 flex flex-col items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer select-none";
    
    if (isSelected) {
      cellClasses += " bg-slate-900 text-white shadow-lg transform scale-105 z-10";
    } else if (isToday) {
      cellClasses += " bg-blue-50 text-blue-700 border-2 border-blue-200 font-bold";
    } else {
      cellClasses += " text-slate-700 hover:bg-slate-100";
    }

    if (!isCurrentMonth) {
      cellClasses += " opacity-30";
    }

    return (
      <div key={dateStr} className="flex flex-col items-center justify-center">
        <div 
          onClick={() => onSelectDate(date)}
          className={cellClasses}
        >
          <span>{date.getDate()}</span>
          
          {marker && (
            <div 
                className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'ring-2 ring-slate-900' : ''}`}
                style={{ 
                   backgroundColor: marker.type === 'filled' ? marker.color : 'transparent',
                   border: marker.type === 'hollow' || marker.type === 'cross' ? `1.5px solid ${marker.color}` : 'none'
                }} 
            />
          )}
        </div>
      </div>
    );
  };

  const displayedDays = viewMode === 'week' 
    ? getWeekDays(selectedDate) 
    : getDaysInMonthGrid(currentMonth);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900 capitalize">
            {SWEDISH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setViewMode('week')}
             className={`p-2 rounded-lg transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Minimize2 className="w-4 h-4" />
           </button>
           <button 
             onClick={() => setViewMode('month')}
             className={`p-2 rounded-lg transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Maximize2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 mb-2">
          {SWEDISH_DAYS_SHORT.map((day, i) => (
            <div key={i} className="text-center text-xs font-bold text-slate-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-3">
          {displayedDays.map(date => {
            // Check if day belongs to the month being viewed
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const showOpaque = viewMode === 'week' || isCurrentMonth;
            return renderDayCell(date, showOpaque);
          })}
        </div>
      </div>

      {/* Navigation */}
      {viewMode === 'month' && (
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
           <button 
             onClick={() => onMonthChange(addMonths(currentMonth, -1))}
             className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
           >
             <ChevronLeft className="w-4 h-4 mr-1" />
             Föregående
           </button>
           <button 
             onClick={() => onMonthChange(addMonths(currentMonth, 1))}
             className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
           >
             Nästa
             <ChevronRight className="w-4 h-4 ml-1" />
           </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;