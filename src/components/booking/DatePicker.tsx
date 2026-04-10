'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DatePicker({ selectedDate, onDateSelect }: DatePickerProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAvailableDates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar/slots?year=${currentYear}&month=${currentMonth}`);
      const data = await res.json();
      if (data.success) {
        setAvailableDates(new Set(data.dates));
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchAvailableDates();
  }, [fetchAvailableDates]);

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('en-US', { month: 'long' });

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Can't go before current month
  const canGoPrev = currentYear > today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth > today.getMonth() + 1);

  // Build calendar grid
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  // getDay() returns 0=Sun, we need 0=Mon
  const firstDayOfWeek = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7;

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];

  // Fill empty cells before the first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  // Fill remaining cells
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const getDateStr = (day: number) =>
    `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-bold text-[#1A1918] tracking-tight font-[Outfit]">
          Choose your date
        </h2>
        <p className="text-sm text-[#6D6C6A] font-[Outfit] leading-relaxed">
          Select a day for your 30-min discovery call.
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg border border-[#E8E9E6] hover:bg-[#F0F7FA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} className="text-[#1A1918]" />
        </button>
        <span className="text-base font-semibold text-[#1A1918] font-[Outfit]">
          {monthName} {currentYear}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-lg border border-[#E8E9E6] hover:bg-[#F0F7FA] transition-colors"
        >
          <ChevronRight size={18} className="text-[#1A1918]" />
        </button>
      </div>

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {DAY_HEADERS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-[#9C9B99] font-[Outfit] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-col gap-1">
        {weeks.map((weekDays, weekIdx) => (
          <div key={weekIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {weekDays.map((day, dayIdx) => {
              if (day === null) {
                return <div key={dayIdx} className="h-10" />;
              }

              const dateStr = getDateStr(day);
              const isAvailable = availableDates.has(dateStr);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;

              return (
                <button
                  key={dayIdx}
                  onClick={() => isAvailable && onDateSelect(dateStr)}
                  disabled={!isAvailable || isPast}
                  className={`
                    h-10 rounded-lg text-sm font-medium font-[Outfit] transition-all
                    ${isSelected
                      ? 'bg-[#205781] text-white shadow-sm'
                      : isToday && isAvailable
                        ? 'bg-[#E0EFF5] text-[#205781] font-semibold'
                        : isAvailable
                          ? 'text-[#1A1918] hover:bg-[#F0F7FA]'
                          : 'text-[#CBCCC9] cursor-not-allowed'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-xs text-[#9C9B99] font-[Outfit] text-center">Loading availability...</p>
      )}
    </div>
  );
}
