import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import Calendar, { CalendarMarker } from '../components/Calendar';
import DayDetailCard from '../components/DayDetailCard';
import { WorkoutLog } from '../types';
import { toLocalISOString, isSameDay } from '../utils/dateHelpers';

const CalendarDiary = () => {
  const { userProfile } = useAuth();
  const { currentDate: today } = useTime();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [markers, setMarkers] = useState<CalendarMarker[]>([]);

  // Sync selected date to simulated today on mount
  useEffect(() => {
    setSelectedDate(today);
  }, [today]);

  // Fetch / Generate Data Logic
  // Ideally this fetches from Firestore collection 'workoutLogs'.
  // For now, we simulate by merging 'activityHistory' (completed) with 'trainingSchedule' (planned).
  useEffect(() => {
    if (!userProfile) return;

    const generatedLogs: WorkoutLog[] = [];
    const generatedMarkers: CalendarMarker[] = [];

    // 1. Map Completed History
    const history = userProfile.activityHistory || [];
    history.forEach(entry => {
      generatedLogs.push({
        id: entry.completedAt, // temporary unique id
        date: entry.date,
        status: 'completed',
        workoutType: entry.type === 'circulation' ? 'circulation' : 'rehab',
        level: userProfile.currentLevel,
        painScore: entry.painScore,
        userNote: entry.feedbackMessage
      });

      // Traffic Light Color
      let color = '#4CAF50'; // Green default
      if ((entry.painScore || 0) > 5) color = '#EF4444'; // Red
      else if ((entry.painScore || 0) > 3) color = '#F59E0B'; // Yellow

      generatedMarkers.push({
        date: entry.date,
        color: color,
        type: 'filled'
      });
    });

    // 2. Generate Future Plan (Simple projection based on schedule)
    // Project 2 weeks ahead for demo
    const schedule = [1, 3, 5]; // Mon, Wed, Fri (Mock)
    const startDate = new Date(today); // Start projecting from today
    
    for (let i = 0; i < 14; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = toLocalISOString(d);
        
        // Don't overwrite history
        if (history.some(h => h.date === dateStr)) continue;

        const dayIndex = d.getDay();
        if (schedule.includes(dayIndex)) {
            generatedLogs.push({
                date: dateStr,
                status: 'planned',
                workoutType: 'rehab',
                level: userProfile.currentLevel,
                focusText: "Styrka & Balans"
            });

            generatedMarkers.push({
                date: dateStr,
                color: '#CBD5E1', // Slate-300
                type: 'hollow'
            });
        }
    }

    setLogs(generatedLogs);
    setMarkers(generatedMarkers);

  }, [userProfile, today]);

  // Get log for selected date
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