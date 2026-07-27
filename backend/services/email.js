/**
 * Sends a real verification OTP email to the user's email address.
 * Configurable via environment variables:
 * GMAIL_USER / SMTP_USER & GMAIL_PASS / SMTP_PASS
 */
export async function sendVerificationEmail(toEmail, otpCode) {
  const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.GMAIL_PASS || process.env.SMTP_PASS;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #059669; margin: 0; font-size: 24px;">FeedHope Rescue Platform</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Email Verification Code</p>
      </div>

      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Thank you for registering with <strong>FeedHope</strong>. Please use the verification code below to verify your email address and activate your account:</p>

      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #059669; background-color: #ecfdf5; padding: 16px 32px; border-radius: 10px; border: 1px border-emerald-200;">
          ${otpCode}
        </div>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This verification code will expire in 10 minutes. If you did not request this email, please ignore it.</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Together we can make a difference today &bull; FeedHope Platform</p>
    </div>
  `;

  if (smtpUser && smtpPass) {
    const cleanUser = smtpUser.trim();
    const cleanPass = smtpPass.replace(/\s+/g, '');

    try {
      // Dynamic import of nodemailer to prevent ERR_MODULE_NOT_FOUND startup crashes
      const nodemailerModule = await import('nodemailer');
      const nodemailer = nodemailerModule.default || nodemailerModule;

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: cleanUser,
          pass: cleanPass
        }
      });

      try {
        const info = await transporter.sendMail({
          from: `"FeedHope Platform" <${cleanUser}>`,
          to: toEmail,
          subject: `FeedHope Verification Code: ${otpCode}`,
          html: htmlContent
        });
        console.log(`\n==================================================`);
        console.log(`[Email Service] REAL EMAIL SENT SUCCESSFULLY TO ${toEmail}!`);
        console.log(`[MessageId]: ${info.messageId}`);
        console.log(`==================================================\n`);
        return { success: true, messageId: info.messageId };
      } catch (firstErr) {
        console.warn('[Email Service] Standard Gmail transport failed, retrying via Direct SSL (port 465)...', firstErr.message);

        // Fallback: Direct SSL port 465 for Windows / Restricted network environments
        const fallbackTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: cleanUser,
            pass: cleanPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const info = await fallbackTransporter.sendMail({
          from: `"FeedHope Platform" <${cleanUser}>`,
          to: toEmail,
          subject: `FeedHope Verification Code: ${otpCode}`,
          html: htmlContent
        });

        console.log(`\n==================================================`);
        console.log(`[Email Service] REAL EMAIL SENT SUCCESSFULLY TO ${toEmail} (via SSL Port 465)!`);
        console.log(`[MessageId]: ${info.messageId}`);
        console.log(`==================================================\n`);
        return { success: true, messageId: info.messageId };
      }
    } catch (err) {
      console.error(`\n==================================================`);
      console.error(`[Email Service] ERROR: Failed to send email to ${toEmail}`);
      console.error(`[Details]:`, err.message);
      console.log(`[VERIFICATION CODE FOR ${toEmail}]: ${otpCode}`);
      console.error(`==================================================\n`);
      return { success: false, error: err.message, fallbackCode: otpCode };
    }
  }

  console.log(`\n==================================================`);
  console.log(`[AUTH EMAIL DISPATCH] Verification OTP for ${toEmail}`);
  console.log(`[VERIFICATION CODE]: ${otpCode}`);
  console.log(`==================================================\n`);
  return { success: true, simulated: true };
}
