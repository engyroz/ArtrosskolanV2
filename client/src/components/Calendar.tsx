import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Maximize2, Minimize2 } from 'lucide-react';
import { 
  toLocalISOString, 
  isSameDay, 
  getWeekDays, 
  getDaysInMonthGrid, 
  SWEDISH_MONTHS, 
  SWEDISH_DAYS_SHORT,
  addMonths
} from '../utils/dateHelpers';
import { ActivityLogEntry } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  schedule: number[]; // Array of weekdays (0=Sun, 1=Mon)
  history: ActivityLogEntry[];
  startDate?: Date; // The date the user started the program
  currentDate: Date; // The "Simulated Today" passed from parent
}

type DayStatus = 'completed' | 'missed' | 'today_active' | 'today_rest' | 'planned' | 'rest';

const Calendar = ({ selectedDate, onSelectDate, schedule, history, startDate, currentDate }: CalendarProps) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sync current month view when selected date changes significantly
  useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  const getStatus = (date: Date): DayStatus => {
    const dateStr = toLocalISOString(date);
    const todayStr = toLocalISOString(currentDate);
    
    // Check Log
    const log = history.find(h => h.date === dateStr);
    if (log) return 'completed';

    const dayOfWeek = date.getDay(); // 0-6
    const isScheduled = schedule.includes(dayOfWeek);

    // Today (Simulated)
    if (dateStr === todayStr) {
      return isScheduled ? 'today_active' : 'today_rest';
    }

    // Past (Relative to Simulated Today)
    if (date < currentDate) {
      // Logic Check: Don't mark as missed if it's before the user started
      if (startDate && dateStr < toLocalISOString(startDate)) {
        return 'rest';
      }

      // If it was a scheduled day, but no log found (and not today), it's missed
      if (isScheduled) return 'missed';
    }

    // Future (Relative to Simulated Today)
    if (date > currentDate && isScheduled) return 'planned';

    return 'rest';
  };

  const renderDayCell = (date: Date, isCurrentMonth = true) => {
    const status = getStatus(date);
    const isSelected = isSameDay(date, selectedDate);
    
    let baseClasses = "relative w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer select-none";
    let statusClasses = "";
    let indicator = null;

    switch (status) {
      case 'completed':
        statusClasses = "bg-green-500 text-white shadow-sm hover:bg-green-600";
        indicator = <Check className="w-4 h-4" />;
        break;
      case 'missed':
        statusClasses = "border-2 border-dashed border-slate-300 text-slate-400 hover:border-slate-400";
        break;
      case 'today_active':
        // Added pulse effect specifically to the shadow/border for today
        statusClasses = "bg-white border-2 border-blue-600 text-blue-700 shadow-lg shadow-blue-100 font-bold animate-pulse";
        break;
      case 'today_rest':
        statusClasses = "bg-slate-100 text-slate-500 border-2 border-transparent font-bold";
        break;
      case 'planned':
        statusClasses = "bg-white border border-slate-300 text-slate-700 hover:border-blue-400";
        break;
      case 'rest':
        statusClasses = "text-slate-400 hover:bg-slate-100";
        break;
    }

    // Selection Visuals
    if (isSelected) {
      if (status === 'completed') {
        statusClasses += " ring-4 ring-slate-300 z-10";
      } else {
        statusClasses += " bg-slate-200 text-slate-900 border-slate-300 z-10 transform scale-105";
      }
    }

    if (!isCurrentMonth) {
      statusClasses += " opacity-30";
    }

    return (
      <div key={toLocalISOString(date)} className="flex flex-col items-center justify-center">
        <div 
          onClick={() => onSelectDate(date)}
          className={`${baseClasses} ${statusClasses}`}
        >
          {indicator || date.getDate()}
        </div>
        {/* Helper dots for rest days */}
        {status === 'rest' && !isSelected && (
           <div className="w-1 h-1 rounded-full bg-slate-200 mt-1"></div>
        )}
      </div>
    );
  };

  const displayedDays = viewMode === 'week' 
    ? getWeekDays(selectedDate) 
    : getDaysInMonthGrid(currentMonth);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900 capitalize">
            {SWEDISH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
           <button 
             onClick={() => setViewMode('week')}
             className={`p-1.5 rounded-md transition-all ${viewMode === 'week' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             title="Veckovy"
           >
             <Minimize2 className="w-4 h-4" />
           </button>
           <button 
             onClick={() => setViewMode('month')}
             className={`p-1.5 rounded-md transition-all ${viewMode === 'month' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             title="Månadsvy"
           >
             <Maximize2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-2">
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {SWEDISH_DAYS_SHORT.map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Days Body */}
        <div className="grid grid-cols-7 gap-y-4">
          {displayedDays.map(date => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const showOpaque = viewMode === 'week' || isCurrentMonth;
            return renderDayCell(date, showOpaque);
          })}
        </div>
      </div>

      {/* Month Navigation (Only visible in Month view) */}
      {viewMode === 'month' && (
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
           <button 
             onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
             className="flex items-center text-sm text-slate-600 hover:text-blue-600 font-medium"
           >
             <ChevronLeft className="w-4 h-4 mr-1" />
             Föregående
           </button>
           <button 
             onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
             className="flex items-center text-sm text-slate-600 hover:text-blue-600 font-medium"
           >
             Nästa
             <ChevronRight className="w-4 h-4 ml-1" />
           </button>
        </div>
      )}
      
      {/* Legend / Help Text */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500 justify-center border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500"></div> Klart
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-blue-600 animate-pulse"></div> Idag (Simulerat)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-slate-300"></div> Missat
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-200"></div> Vald
        </div>
      </div>
    </div>
  );
};

export default Calendar;
