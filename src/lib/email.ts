import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOtpEmail({
  to,
  otp,
}: {
  to: string;
  otp: string;
}) {
  return await resend.emails.send({
    from: "Vanguox <no-reply@vanguox.com>",
    to,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🔐 Your One-Time Password</h2>
        <p>Use the OTP below to verify your identity:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f1f5f9; padding: 12px 20px; display: inline-block; border-radius: 8px; margin: 16px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">If you didn't request this, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #888;">- Vanguox Team</p>
      </div>
    `,
  });
}