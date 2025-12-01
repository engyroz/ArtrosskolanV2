// Helper to get YYYY-MM-DD in local time (prevents timezone issues)
export const toLocalISOString = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return toLocalISOString(d1) === toLocalISOString(d2);
};

export const getDayOfWeek = (date: Date): number => {
  // 0 = Sunday, 1 = Monday...
  return date.getDay();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust so Monday is 0 index for calculation. Standard JS Sunday=0.
  // If Sunday (0), subtract 6 days. Else subtract day-1.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
};

export const getDaysInMonthGrid = (monthDate: Date): Date[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  
  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Get the Monday of that week (even if it's in prev month)
  const startGrid = getStartOfWeek(firstDayOfMonth);
  
  const days: Date[] = [];
  // Generate 42 days (6 weeks) to cover any month layout
  for (let i = 0; i < 42; i++) {
    days.push(addDays(startGrid, i));
  }
  return days;
};

export const getWeekDays = (centerDate: Date): Date[] => {
  const start = getStartOfWeek(centerDate);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

export const SWEDISH_MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
];

export const SWEDISH_DAYS_SHORT = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];