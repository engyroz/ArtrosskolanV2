import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import Calendar, { CalendarMarker } from '../components/Calendar';
import DayDetailCard from '../components/DayDetailCard';
import { WorkoutLog, SessionStatus } from '../types';
import { toLocalISOString, isSameDay, getDaysInMonthGrid } from '../utils/dateHelpers';

const CalendarDiary = () => {
  const { userProfile } = useAuth();
  const { currentDate: today } = useTime();
  
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [markers, setMarkers] = useState<CalendarMarker[]>([]);

  // Sync selected date to simulated today on mount
  useEffect(() => {
    setSelectedDate(today);
    setCurrentMonth(today);
  }, [today]);

  useEffect(() => {
    if (!userProfile) return;

    const history = userProfile.activityHistory || [];
    const level = userProfile.currentLevel || 1;
    
    // Define Schedule based on Level (SOP)
    // Level 1: Daily (0-6)
    // Level 2+: Mon(1), Wed(3), Fri(5)
    const schedule = level === 1 ? [0, 1, 2, 3, 4, 5, 6] : [1, 3, 5];

    // Generate data for the ENTIRE visible grid (including prev/next month buffer days)
    const daysInView = getDaysInMonthGrid(currentMonth);
    
    const generatedLogs: WorkoutLog[] = [];
    const generatedMarkers: CalendarMarker[] = [];

    daysInView.forEach(date => {
        const dateStr = toLocalISOString(date);
        const dayIndex = date.getDay();
        
        // 1. Check History
        const entry = history.find(h => h.date === dateStr);
        
        if (entry) {
            // COMPLETED
            generatedLogs.push({
                id: entry.completedAt,
                date: dateStr,
                status: 'completed',
                workoutType: entry.type === 'circulation' ? 'circulation' : 'rehab',
                level: level,
                painScore: entry.painScore,
                userNote: entry.feedbackMessage
            });

            // Color Logic (Traffic Light)
            let color = '#4CAF50'; // Green
            if ((entry.painScore || 0) > 5) color = '#EF4444'; // Red
            else if ((entry.painScore || 0) > 3) color = '#F59E0B'; // Yellow
            // If just circulation/activity, maybe Blue?
            if (entry.type === 'circulation') color = '#3B82F6'; 

            generatedMarkers.push({ date: dateStr, color, type: 'filled' });
        } 
        else if (schedule.includes(dayIndex)) {
            // SCHEDULED but NO LOG
            
            // If in Past (and not today) -> Missed
            if (date < today && !isSameDay(date, today)) {
                generatedLogs.push({
                    date: dateStr,
                    status: 'missed',
                    workoutType: 'rehab',
                    level: level,
                    focusText: "Missat pass"
                });
                generatedMarkers.push({ date: dateStr, color: '#EF4444', type: 'hollow' }); // Red hollow/cross
            } 
            // If Today or Future -> Planned
            else {
                generatedLogs.push({
                    date: dateStr,
                    status: 'planned',
                    workoutType: 'rehab',
                    level: level,
                    focusText: level === 1 ? "Kontakt & Ro" : "Styrka & Balans"
                });
                generatedMarkers.push({ date: dateStr, color: '#CBD5E1', type: 'hollow' }); // Gray hollow
            }
        }
        else {
            // REST DAY
            // No log, no marker
        }
    });

    setLogs(generatedLogs);
    setMarkers(generatedMarkers);

  }, [userProfile, currentMonth, today]);

  const selectedLog = logs.find(l => l.date === toLocalISOString(selectedDate));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        <div className="pt-4 px-2">
            <h1 className="text-2xl font-bold text-slate-900">Min Plan</h1>
            <p className="text-slate-500">Överblick över din träning.</p>
        </div>

        <Calendar 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          markers={markers}
          currentDate={today}
        />

        <DayDetailCard 
          date={selectedDate} 
          log={selectedLog}
          isToday={isSameDay(selectedDate, today)}
        />

      </div>
    </div>
  );
};

export default CalendarDiary;