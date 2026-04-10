export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image?: string;
  excerpt?: string;
  published_at?: string;
  author?: string;
  is_published: boolean;
  created_at: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at?: string;
}

export interface ServiceBooking {
  id?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_type: string;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  name?: string;
  subscribed_at?: string;
  is_active: boolean;
}

export type ServiceType = 'Financial Consultation' | 'Financial Tracker Templates' | 'Comprehensive Planning';

export interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_type: string;
  amount: number;
  payment_status: 'pending_payment' | 'paid' | 'failed' | 'expired' | 'refunded';
  doku_invoice_id?: string;
  doku_payment_url?: string;
  payment_method?: string;
  booking_date?: string;
  booking_time?: string;
  paid_at?: string;
  created_at: string;
}
