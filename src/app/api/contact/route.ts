import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid form data' },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = result.data;

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, phone, subject, message }])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!',
      messageId: data.id 
    });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
