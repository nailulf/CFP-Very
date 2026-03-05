-- Enable Row Level Security
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_bookings ENABLE ROW LEVEL SECURITY;

-- Create table: contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy for contact_messages: Allow anyone to insert, only authenticated to view
CREATE POLICY "Allow anonymous insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated select" ON contact_messages FOR SELECT TO authenticated USING (true);


-- Create table: blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    excerpt TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy for blog_posts: Allow public read access, authenticated write access
CREATE POLICY "Allow public read" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all" ON blog_posts FOR ALL TO authenticated USING (true);


-- Create table: newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy for newsletter_subscribers: Allow anonymous insert, authenticated select
CREATE POLICY "Allow anonymous insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated select" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);


-- Create table: service_bookings
CREATE TABLE IF NOT EXISTS service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    service_type VARCHAR(100) NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_email ON service_bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_service_bookings_date ON service_bookings(booking_date);

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

-- Policy for service_bookings: Allow anonymous insert, authenticated select
CREATE POLICY "Allow anonymous insert" ON service_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated select" ON service_bookings FOR SELECT TO authenticated USING (true);
