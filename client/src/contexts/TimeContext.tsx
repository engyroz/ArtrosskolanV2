
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { addDays as addDaysHelper } from '../utils/dateHelpers';

interface TimeContextType {
  currentDate: Date;
  addDays: (days: number) => void;
  subDays: (days: number) => void;
  reset: () => void;
  isDebugVisible: boolean;
  toggleDebug: () => void;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};

export const TimeProvider = ({ children }: { children?: ReactNode }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isDebugVisible, setIsDebugVisible] = useState(() => {
    return localStorage.getItem('showTimeTravelDebug') === 'true';
  });

  const addDays = (days: number) => {
    setCurrentDate((prev) => addDaysHelper(prev, days));
  };

  const subDays = (days: number) => {
    setCurrentDate((prev) => addDaysHelper(prev, -days));
  };

  const reset = () => {
    setCurrentDate(new Date());
  };

  const toggleDebug = () => {
    setIsDebugVisible(prev => {
        const newState = !prev;
        localStorage.setItem('showTimeTravelDebug', String(newState));
        return newState;
    });
  };

  return (
    <TimeContext.Provider value={{ currentDate, addDays, subDays, reset, isDebugVisible, toggleDebug }}>
      {children}
    </TimeContext.Provider>
  );
};
