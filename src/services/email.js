const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(to, resetToken) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to,
    subject: 'Reset your password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p style="margin-top:16px;color:#666;font-size:14px;">If you didn't request this, ignore this email.</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
