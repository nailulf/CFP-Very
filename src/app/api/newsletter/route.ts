import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email, name } = result.data;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, name }]);

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { success: false, message: 'You are already subscribed!' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Successfully subscribed!' });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
