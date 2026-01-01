
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { useNavigate } from 'react-router-dom';
import Calendar, { CalendarMarker } from '../components/Calendar';
import DayDetailCard from '../components/DayDetailCard';
import { WorkoutLog, SessionStatus, ActivityLogEntry } from '../types';
import { toLocalISOString, isSameDay, getDaysInMonthGrid } from '../utils/dateHelpers';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { PHYSICAL_ACTIVITY_TASKS } from '../utils/textConstants';

const CalendarDiary = () => {
  const navigate = useNavigate();
  const { userProfile, user, refreshProfile } = useAuth();
  const { currentDate: today } = useTime();
  
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [markers, setMarkers] = useState<CalendarMarker[]>([]);

  useEffect(() => {
    setSelectedDate(today);
    setCurrentMonth(today);
  }, [today]);

  useEffect(() => {
    if (!userProfile) return;

    const historyLog = userProfile.activityHistory || [];
    const level = userProfile.currentLevel || 1;
    const schedule = level === 1 ? [0, 1, 2, 3, 4, 5, 6] : [1, 3, 5];

    const daysInView = getDaysInMonthGrid(currentMonth);
    
    const generatedLogs: WorkoutLog[] = [];
    const generatedMarkers: CalendarMarker[] = [];

    daysInView.forEach(date => {
        const dateStr = toLocalISOString(date);
        const dayIndex = date.getDay();
        
        const entry = historyLog.find(h => h.date === dateStr && h.type !== 'daily_activity'); 
        
        if (entry) {
            generatedLogs.push({
                id: entry.completedAt,
                date: dateStr,
                status: 'completed',
                workoutType: entry.type === 'circulation' ? 'circulation' : 'rehab',
                level: level,
                painScore: entry.painScore,
                userNote: entry.feedbackMessage,
                exertion: entry.exertion,
                completedAt: entry.completedAt
            });

            let color = '#4CAF50'; 
            if ((entry.painScore || 0) > 5) color = '#EF4444'; 
            else if ((entry.painScore || 0) > 3) color = '#F59E0B'; 
            
            const iconType = entry.type === 'rehab' ? 'rehab' : 'activity';
            generatedMarkers.push({ date: dateStr, color, type: 'filled', iconType });
        } 
        else if (schedule.includes(dayIndex)) {
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
    });

    setLogs(generatedLogs);
    setMarkers(generatedMarkers);

  }, [userProfile, currentMonth, today]);

  const selectedLog = logs.find(l => l.date === toLocalISOString(selectedDate));
  
  const handleStartRehab = () => {
      navigate('/dashboard'); 
  };

  const handleToggleActivity = async () => {
      if (!user) return;
      
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
          
          const userRef = db.collection('users').doc(user.uid);
          await userRef.update({
              activityHistory: firebase.firestore.FieldValue.arrayUnion(newLog),
              "progression.experiencePoints": (userProfile?.progression?.experiencePoints || 0) + 10
          });
          await refreshProfile();
      } catch (e) {
          console.error(e);
      }
  };

  const handleUpdateNote = async (note: string) => {
    if (!user || !selectedLog) return;
    
    try {
        const userRef = db.collection('users').doc(user.uid);
        const newHistory = [...(userProfile?.activityHistory || [])];
        
        const entryIndex = newHistory.findIndex(h => h.completedAt === selectedLog.id);
        if (entryIndex !== -1) {
            newHistory[entryIndex] = {
                ...newHistory[entryIndex],
                feedbackMessage: note
            };
            
            await userRef.update({
                activityHistory: newHistory
            });
            await refreshProfile();
        }
    } catch (e) {
        console.error("Failed to update note", e);
    }
  };

  const activityLog = userProfile?.activityHistory?.find(h => 
      h.date === toLocalISOString(selectedDate) && h.type === 'daily_activity'
  );

  const currentLevel = userProfile?.currentLevel || 1;
  const activityConfig = PHYSICAL_ACTIVITY_TASKS[currentLevel as keyof typeof PHYSICAL_ACTIVITY_TASKS] || PHYSICAL_ACTIVITY_TASKS[1];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-md mx-auto relative flex flex-col h-full">
        
        <div className="z-20 bg-slate-50 pt-2 pb-4 px-2">
            <Calendar 
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                markers={markers}
                currentDate={today}
            />
        </div>

        <div className="flex-grow px-2 animate-fade-in">
            <DayDetailCard 
                date={selectedDate} 
                log={selectedLog}
                isToday={isSameDay(selectedDate, today)}
                onStartRehab={handleStartRehab}
                onToggleActivity={handleToggleActivity}
                isActivityDone={!!activityLog}
                activityConfig={activityConfig}
                isFuture={selectedDate > today}
                onSaveNote={handleUpdateNote}
                level={currentLevel} // Pass level for dynamic text
            />
        </div>

      </div>
    </div>
  );
};

export default CalendarDiary;
