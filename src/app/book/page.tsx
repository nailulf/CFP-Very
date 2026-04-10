'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutHeader } from '@/components/booking/CheckoutHeader';
import { DatePicker } from '@/components/booking/DatePicker';
import { TimeSlots } from '@/components/booking/TimeSlots';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { services } from '@/data/services';

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

export default function BookPage() {
  const router = useRouter();
  const service = services[0]; // Default to discovery call

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    const bookingData = {
      serviceId: service.id,
      serviceName: service.name,
      duration: service.duration,
      price: service.price,
      bookingDate: selectedDate,
      bookingTime: selectedTime.display,
      bookingStart: selectedTime.start,
      bookingEnd: selectedTime.end,
    };
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    router.push('/book/payment');
  };

  return (
    <div className="min-h-screen bg-[#F0F7FA] flex flex-col">
      <CheckoutHeader activeStep={1} backHref="/" />

      <main className="flex-1 flex justify-center px-4">
        <div className="flex gap-10 py-12 max-w-[1120px] w-full">
          {/* Left: Calendar Card */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-[#E8E9E6] shadow-sm p-7">
              <DatePicker
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null); // Reset time when date changes
                }}
              />
            </div>
          </div>

          {/* Right: Time Slots + Summary */}
          <div className="flex flex-col gap-5 w-[380px]">
            <div className="bg-white rounded-2xl border border-[#E8E9E6] shadow-sm p-6 flex flex-col gap-4">
              <TimeSlots
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            </div>

            <BookingSummary
              serviceName={service.name}
              date={selectedDate ? formatDateForDisplay(selectedDate) : undefined}
              time={selectedTime?.display}
              duration={service.duration}
              price={service.price}
              isDateSelected={!!selectedDate && !!selectedTime}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
