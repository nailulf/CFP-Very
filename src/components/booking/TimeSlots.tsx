'use client';

import { useState, useEffect } from 'react';

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

interface TimeSlotsProps {
  selectedDate: string | null;
  selectedTime: TimeSlot | null;
  onTimeSelect: (slot: TimeSlot) => void;
}

export function TimeSlots({ selectedDate, selectedTime, onTimeSelect }: TimeSlotsProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    async function fetchSlots() {
      setLoading(true);
      try {
        const res = await fetch(`/api/calendar/slots?date=${selectedDate}`);
        const data = await res.json();
        if (data.success) {
          setSlots(data.slots);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [selectedDate]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-bold text-[#1A1918] font-[Outfit]">Available times</h3>
        {selectedDate && (
          <p className="text-sm text-[#4F9DA6] font-[Outfit]">{formatDate(selectedDate)}</p>
        )}
      </div>

      {!selectedDate && (
        <p className="text-sm text-[#9C9B99] font-[Outfit] py-4">
          Select a date to see available times
        </p>
      )}

      {loading && (
        <p className="text-sm text-[#9C9B99] font-[Outfit] py-4">Loading times...</p>
      )}

      {!loading && selectedDate && slots.length === 0 && (
        <p className="text-sm text-[#9C9B99] font-[Outfit] py-4">
          No available times for this date
        </p>
      )}

      {!loading && slots.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {slots.map((slot) => {
            const isSelected = selectedTime?.start === slot.start;
            return (
              <button
                key={slot.start}
                onClick={() => onTimeSelect(slot)}
                className={`
                  h-10 rounded-lg text-sm font-medium font-[Outfit] transition-all border
                  ${isSelected
                    ? 'bg-[#205781] text-white border-[#205781]'
                    : 'text-[#1A1918] border-[#E8E9E6] hover:border-[#4F9DA6] hover:bg-[#F0F7FA]'
                  }
                `}
              >
                {slot.display}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
