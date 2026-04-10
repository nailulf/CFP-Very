import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

interface BookingEmailParams {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  duration: string;
  price: string;
  startTime: Date;
  endTime: Date;
  meetLink?: string | null;
}

function generateICS(params: BookingEmailParams): string {
  const formatICSDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const now = new Date();
  const meetLine = params.meetLink
    ? `\\n\\nGoogle Meet: ${params.meetLink}`
    : '';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Teman Tumbuh//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(params.startTime)}`,
    `DTEND:${formatICSDate(params.endTime)}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `SUMMARY:Discovery Call - Aditya Very Cleverina`,
    `DESCRIPTION:${params.serviceName} with Aditya Very Cleverina\\nDuration: ${params.duration}${meetLine}\\n\\nQuestions? hello@temantumbuh.com`,
    ...(params.meetLink ? [`LOCATION:${params.meetLink}`] : []),
    `ORGANIZER;CN=Aditya Very Cleverina:mailto:${process.env.GMAIL_USER}`,
    `ATTENDEE;CN=${params.clientName}:mailto:${params.clientEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export async function sendBookingConfirmation(params: BookingEmailParams) {
  const icsContent = generateICS(params);
  const transporter = getTransporter();

  const meetSection = params.meetLink
    ? `
        <div style="background: #FFFFFF; border: 1px solid #E8E9E6; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <p style="color: #1A1918; font-size: 14px; font-weight: 600; margin: 0 0 12px;">Join via Google Meet</p>
          <a href="${params.meetLink}" style="display: inline-block; background: linear-gradient(180deg, #205781 0%, #4F9DA6 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 999px; font-size: 15px; font-weight: 600;">
            Join Meeting
          </a>
          <p style="color: #9C9B99; font-size: 12px; margin-top: 12px;">
            <a href="${params.meetLink}" style="color: #205781; word-break: break-all;">${params.meetLink}</a>
          </p>
        </div>
      `
    : '';

  await transporter.sendMail({
    from: `"Teman Tumbuh" <${process.env.GMAIL_USER}>`,
    to: params.clientEmail,
    subject: `Booking Confirmed - ${params.serviceName}`,
    html: `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(180deg, #4F9DA6 0%, #205781 100%); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 28px;">✓</span>
          </div>
          <h1 style="color: #1A1918; font-size: 24px; font-weight: 800; margin: 0;">Booking Confirmed!</h1>
          <p style="color: #6D6C6A; font-size: 15px; margin-top: 8px;">
            Your discovery call with Aditya has been scheduled.
          </p>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #E8E9E6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #1A1918; font-size: 16px; font-weight: 700; margin: 0 0 16px;">Booking Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6D6C6A; font-size: 14px;">Session</td>
              <td style="padding: 8px 0; color: #1A1918; font-size: 14px; font-weight: 600; text-align: right;">${params.serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6D6C6A; font-size: 14px;">Date</td>
              <td style="padding: 8px 0; color: #1A1918; font-size: 14px; font-weight: 600; text-align: right;">${params.bookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6D6C6A; font-size: 14px;">Time</td>
              <td style="padding: 8px 0; color: #1A1918; font-size: 14px; font-weight: 600; text-align: right;">${params.bookingTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6D6C6A; font-size: 14px;">Duration</td>
              <td style="padding: 8px 0; color: #1A1918; font-size: 14px; font-weight: 600; text-align: right;">${params.duration}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6D6C6A; font-size: 14px;">Price</td>
              <td style="padding: 8px 0; color: #4F9DA6; font-size: 14px; font-weight: 700; text-align: right;">${params.price}</td>
            </tr>
          </table>
        </div>

        ${meetSection}

        <div style="background: #E0EFF5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #205781; font-size: 13px; font-weight: 500; margin: 0; line-height: 1.5;">
            A calendar invite (.ics) is attached to this email. Open it to add the event to your calendar.
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <p style="color: #9C9B99; font-size: 13px; margin: 0;">
            Questions? Reach out to <a href="mailto:hello@temantumbuh.com" style="color: #205781;">hello@temantumbuh.com</a>
          </p>
        </div>
      </div>
    `,
    icalEvent: {
      filename: 'booking.ics',
      method: 'REQUEST',
      content: icsContent,
    },
  });
}
