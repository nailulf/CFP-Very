export type BookingStep = 'schedule' | 'details' | 'confirm';

export type BookingForm = {
  date: string;      // 'YYYY-MM-DD' from getSelectableDates
  timeSlot: string;  // 'HH:mm' from getSlotsForDate
  name: string;
  email: string;
  phone: string;
  topic: string;     // free-text "what do you want to consult about"
};

export const EMPTY_BOOKING: BookingForm = {
  date: '',
  timeSlot: '',
  name: '',
  email: '',
  phone: '',
  topic: '',
};
