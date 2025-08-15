'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  message,
  senderName
}: {
  to: string;
  subject: string;
  message: string;
  senderName?: string;
}) {
  try {
    const data = await resend.emails.send({
      from: `${senderName || 'Your App'} <no-reply@vanguox.com>`, // must be your verified domain
      to: [to],
      subject,
      text: message,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: (error as Error).message };
  }
}
