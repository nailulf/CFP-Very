# Aditya Very Cleverina - Certified Financial Planner

Professional landing page for Aditya Very Cleverina, a Certified Financial Planner (CFP®). This project is built with Next.js 14, Tailwind CSS, and Supabase.

## Features

- **Responsive Design**: Optimized for mobile, tablet, and desktop.
- **Services Showcase**: Detailed descriptions of financial consultation, mentoring, and comprehensive planning.
- **Blog Platform**: Educational content with search and filtering capabilities.
- **Contact & Scheduling**: Integrated contact form and call-to-action for consultations.
- **Supabase Integration**: Backend support for contact messages and newsletter subscriptions.
- **Modern UI/UX**: Clean, professional aesthetic using Tailwind CSS and Framer Motion animations.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Supabase
- **Deployment**: Vercel

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd cfp-landing-page
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: App router pages and layouts
- `src/components`: Reusable UI components and page sections
- `src/lib`: Utility functions and Supabase client
- `src/types`: TypeScript interfaces
- `supabase`: Database migrations

## License

[MIT](LICENSE)
