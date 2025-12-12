import React from 'react';
import { Dream } from '../types';

interface CalendarProps {
  dreams: Dream[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export const SimpleCalendar: React.FC<CalendarProps> = ({ dreams, selectedDate, onSelectDate }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());

  // Helpers
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay(); // 0 = Sunday

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear); // 0-6
  
  // Adjust for Monday start (Russian calendar style usually starts Monday)
  // JS getDay(): 0=Sun, 1=Mon... 
  // We want 0=Mon, 6=Sun
  const startDayOffset = firstDay === 0 ? 6 : firstDay - 1; 

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  // Check if a day has a dream
  const hasDream = (day: number) => {
    return dreams.some(d => {
      const dDate = new Date(d.date);
      return dDate.getDate() === day && dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
    });
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
  };

  return (
    <div className="bg-night-800 p-4 rounded-xl mb-6 shadow-lg border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="text-slate-400 hover:text-white p-2">&lt;</button>
        <h3 className="font-semibold text-lg capitalize">{monthNames[currentMonth]} {currentYear}</h3>
        <button onClick={handleNextMonth} className="text-slate-400 hover:text-white p-2">&gt;</button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const hasEntry = hasDream(day);
          const active = isSelected(day);
          
          return (
            <button
              key={day}
              onClick={() => onSelectDate(new Date(currentYear, currentMonth, day))}
              className={`
                h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all relative
                ${active ? 'bg-mystic-600 text-white font-bold' : 'hover:bg-slate-700 text-slate-300'}
              `}
            >
              {day}
              {hasEntry && !active && (
                <div className="absolute bottom-1 w-1 h-1 bg-mystic-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
