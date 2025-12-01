import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, ChevronUp, Dumbbell, Heart, Coffee } from 'lucide-react';
import { 
  toLocalISOString, 
  isSameDay, 
  getWeekDays, 
  getDaysInMonthGrid, 
  SWEDISH_MONTHS, 
  SWEDISH_DAYS_SHORT,
  addMonths,
  addDays
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
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week'); // Default to Week

  const toggleView = () => {
    setViewMode(prev => prev === 'week' ? 'month' : 'week');
  };

  const renderMarkerIcon = (marker: CalendarMarker, isSelected: boolean) => {
    // Week View: Show Icons
    const iconClass = `w-3 h-3 ${isSelected ? 'text-white' : ''}`;
    const style = { color: isSelected ? 'white' : marker.color };

    if (marker.type === 'hollow' && marker.color === '#CBD5E1') return null; // Don't show planned icons in small view if distracting

    if (marker.iconType === 'rehab') return <Dumbbell className={iconClass} style={style} />;
    if (marker.iconType === 'activity') return <Heart className={iconClass} style={style} />;
    
    // Default dot if no specific icon or for simple markers
    return (
        <div 
            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'ring-1 ring-white' : ''}`}
            style={{ 
               backgroundColor: marker.type === 'filled' ? marker.color : 'transparent',
               border: marker.type === 'hollow' || marker.type === 'cross' ? `1.5px solid ${marker.color}` : 'none'
            }} 
        />
    );
  };

  const renderDayCell = (date: Date, isCurrentMonth = true) => {
    const dateStr = toLocalISOString(date);
    const isSelected = isSameDay(date, selectedDate);
    const isToday = isSameDay(date, currentDate);
    
    const marker = markers.find(m => m.date === dateStr);

    let cellClasses = "relative w-10 h-14 flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer select-none border";
    
    if (isSelected) {
      cellClasses += " bg-blue-600 border-blue-600 text-white shadow-md transform scale-105 z-10";
    } else if (isToday) {
      cellClasses += " bg-blue-50 border-blue-200 text-blue-700 font-bold";
    } else {
      cellClasses += " bg-white border-transparent text-slate-700 hover:bg-slate-50";
    }

    if (!isCurrentMonth && viewMode === 'month') {
      cellClasses += " opacity-30";
    }

    return (
      <div key={dateStr} className="flex flex-col items-center justify-center">
        <div 
          onClick={() => onSelectDate(date)}
          className={cellClasses}
        >
          <span className="text-[10px] font-bold uppercase mb-1 opacity-70">
            {SWEDISH_DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}
          </span>
          <span className="text-lg leading-none mb-1">{date.getDate()}</span>
          
          {/* Marker Logic */}
          <div className="h-4 flex items-center justify-center">
             {marker ? (
                 viewMode === 'week' ? renderMarkerIcon(marker, isSelected) : (
                    // Month View: Always Dots
                    <div 
                        className={`w-1.5 h-1.5 rounded-full`}
                        style={{ 
                        backgroundColor: marker.type === 'filled' ? marker.color : 'transparent',
                        border: marker.type === 'hollow' || marker.type === 'cross' ? `1.5px solid ${marker.color}` : 'none'
                        }} 
                    />
                 )
             ) : (
                 // Placeholder for layout stability
                 <div className="w-1.5 h-1.5" />
             )}
          </div>
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
                <button onClick={() => onMonthChange(addMonths(currentMonth, -1))} className="p-1 hover:bg-slate-100 rounded">
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                </button>
                <button onClick={() => onMonthChange(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded">
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
            </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-4 pb-4">
        <div className={`grid grid-cols-7 gap-y-2 transition-all duration-300 ${viewMode === 'week' ? 'gap-x-1' : 'gap-x-1'}`}>
          {displayedDays.map(date => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            // In week view, show all. In month view, fade non-current.
            return renderDayCell(date, isCurrentMonth);
          })}
        </div>
      </div>

      {/* Expand/Collapse Handle */}
      <button 
        onClick={toggleView}
        className="w-full py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider"
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