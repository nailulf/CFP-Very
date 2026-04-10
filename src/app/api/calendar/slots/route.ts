import { NextResponse } from 'next/server';
import { getAvailableSlots, getAvailableDates } from '@/lib/calendar';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // If a specific date is provided, return time slots for that date
    if (date) {
      const slots = await getAvailableSlots(date);
      return NextResponse.json({ success: true, slots });
    }

    // If year/month provided, return available dates for the month
    if (year && month) {
      const dates = await getAvailableDates(Number(year), Number(month));
      return NextResponse.json({ success: true, dates });
    }

    return NextResponse.json(
      { success: false, message: 'Provide either date or year+month' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Calendar slots error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
