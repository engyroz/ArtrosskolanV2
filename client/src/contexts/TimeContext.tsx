import React, { createContext, useContext, useState, ReactNode } from 'react';
import { addDays as addDaysHelper } from '../utils/dateHelpers';

interface TimeContextType {
  currentDate: Date;
  addDays: (days: number) => void;
  subDays: (days: number) => void;
  reset: () => void;
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

  const addDays = (days: number) => {
    setCurrentDate((prev) => addDaysHelper(prev, days));
  };

  const subDays = (days: number) => {
    setCurrentDate((prev) => addDaysHelper(prev, -days));
  };

  const reset = () => {
    setCurrentDate(new Date());
  };

  return (
    <TimeContext.Provider value={{ currentDate, addDays, subDays, reset }}>
      {children}
    </TimeContext.Provider>
  );
};