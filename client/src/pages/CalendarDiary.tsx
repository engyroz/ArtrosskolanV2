import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { useNavigate } from 'react-router-dom';
import Calendar, { CalendarMarker } from '../components/Calendar';
import DayDetailCard from '../components/DayDetailCard';
import { WorkoutLog, SessionStatus } from '../types';
import { toLocalISOString, isSameDay, getDaysInMonthGrid } from '../utils/dateHelpers';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const CalendarDiary = () => {
  const { userProfile, user, refreshProfile } = useAuth();
  const { currentDate: today } = useTime();
  const navigate = useNavigate();
  
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
    
    // Schedule: Level 1 (Daily), Level 2+ (Mon,Wed,Fri)
    const schedule = level === 1 ? [0, 1, 2, 3, 4, 5, 6] : [1, 3, 5];

    const daysInView = getDaysInMonthGrid(currentMonth);
    
    const generatedLogs: WorkoutLog[] = [];
    const generatedMarkers: CalendarMarker[] = [];

    daysInView.forEach(date => {
        const dateStr = toLocalISOString(date);
        const dayIndex = date.getDay();
        
        // 1. Check Completed
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

            // Marker Logic
            let color = '#4CAF50'; // Green
            if ((entry.painScore || 0) > 5) color = '#EF4444'; 
            else if ((entry.painScore || 0) > 3) color = '#F59E0B'; 
            
            // Icon Type for Week View
            const iconType = entry.type === 'rehab' ? 'rehab' : 'activity';

            generatedMarkers.push({ date: dateStr, color, type: 'filled', iconType });
        } 
        else if (schedule.includes(dayIndex)) {
            // SCHEDULED REHAB (No Log)
            if (date < today && !isSameDay(date, today)) {
                generatedLogs.push({
                    date: dateStr,
                    status: 'missed',
                    workoutType: 'rehab',
                    level: level,
                    focusText: "Missat pass"
                });
                generatedMarkers.push({ date: dateStr, color: '#94A3B8', type: 'cross', iconType: 'rehab' }); 
            } 
            else {
                generatedLogs.push({
                    date: dateStr,
                    status: 'planned',
                    workoutType: 'rehab',
                    level: level,
                    focusText: level === 1 ? "Kontakt & Ro" : "Styrka & Balans"
                });
                generatedMarkers.push({ date: dateStr, color: '#CBD5E1', type: 'hollow', iconType: 'rehab' }); 
            }
        }
        else {
            // REST / ACTIVITY DAY
            // Can show activity marker if we want to encourage FaR on off days
            // For now, leave empty or show small dot if FaR planned
        }
    });

    setLogs(generatedLogs);
    setMarkers(generatedMarkers);

  }, [userProfile, currentMonth, today]);

  const selectedLog = logs.find(l => l.date === toLocalISOString(selectedDate));
  
  // Handlers for Detail Card
  const handleStartRehab = () => {
      navigate('/dashboard'); // Go to dashboard to start context
  };

  const handleToggleActivity = async () => {
      if (!user) return;
      // Add 'daily_activity' log for selected date
      // Note: In real app, check if date is today or allow past logging?
      // For now, allow logging on the selected date.
      
      try {
          const newLog = {
            date: toLocalISOString(selectedDate),
            type: 'daily_activity',
            completedAt: new Date().toISOString(),
            painScore: 0, 
            exertion: 'light',
            feedbackMessage: 'Aktivitet från Kalender',
            xpEarned: 10
          };
          
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
              activityHistory: arrayUnion(newLog),
              "progression.experiencePoints": (userProfile?.progression?.experiencePoints || 0) + 10
          });
          await refreshProfile();
      } catch (e) {
          console.error(e);
      }
  };

  // Check if activity exists for selected date (separate from the main log which prioritizes rehab)
  // We need to check history directly since 'logs' might prioritize the rehab entry
  const activityLog = userProfile?.activityHistory?.find(h => 
      h.date === toLocalISOString(selectedDate) && h.type === 'daily_activity'
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto relative">
        
        {/* Calendar Section (Top) */}
        <div className="sticky top-0 z-20">
            <Calendar 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            markers={markers}
            currentDate={today}
            />
        </div>

        {/* Details Section (Bottom) */}
        <div className="pt-4">
            <DayDetailCard 
                date={selectedDate} 
                log={selectedLog}
                isToday={isSameDay(selectedDate, today)}
                onStartRehab={handleStartRehab}
                onToggleActivity={handleToggleActivity}
                isActivityDone={!!activityLog}
            />
        </div>

      </div>
    </div>
  );
};

export default CalendarDiary;