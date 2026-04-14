const nodemailer = require('nodemailer');

// Create Gmail transporter — uses App Password, NOT your real Gmail password
const createTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  
  if (!user || user === 'your_gmail@gmail.com' || !pass) {
    return null; // Gracefully fall back to console simulation
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // 16-char App Password from Google
    },
  });
};

/**
 * Sends an OTP email to the given address.
 * Falls back to console log if Gmail credentials are not configured.
 */
const sendOTPEmail = async (toEmail, otpCode, type = 'email') => {
  const transporter = createTransporter();

  // ── Fallback: console simulation ──────────────────────────────────────────
  if (!transporter) {
    console.log('\n' + '='.repeat(60));
    console.log('  ⚠  GMAIL NOT CONFIGURED — using console simulation');
    console.log(`  ✉  OTP VERIFICATION  [${type.toUpperCase()}]`);
    console.log(`  Target : ${toEmail}`);
    console.log(`  Code   : ${otpCode}`);
    console.log(`  Expires: 5 minutes`);
    console.log('='.repeat(60) + '\n');
    return { simulated: true };
  }

  // ── Real Gmail send ───────────────────────────────────────────────────────
  const subject =
    type === 'email'
      ? '🔐 Your FinTrack Email Verification Code'
      : '📱 Your FinTrack Phone Verification Code';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid #334155;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:32px 40px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">💰</div>
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                FinTrack Pro
              </h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                ${type === 'email' ? 'Email Verification' : 'Phone Verification'}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">
                Use the code below to verify your ${type === 'email' ? 'email address' : 'phone number'}.
                This code expires in <strong style="color:#e2e8f0;">5 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#0f172a;border:2px solid #6366f1;border-radius:16px;
                          padding:28px 20px;margin:0 auto 28px;max-width:300px;">
                <div style="letter-spacing:0.5em;font-size:42px;font-weight:900;color:#a5b4fc;
                            font-family:'Courier New',monospace;">
                  ${otpCode}
                </div>
                <p style="margin:12px 0 0;color:#64748b;font-size:12px;letter-spacing:0.05em;
                          text-transform:uppercase;font-weight:600;">
                  One-Time Password
                </p>
              </div>

              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
                If you didn't request this code, you can safely ignore this email.<br/>
                Do not share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:20px 40px;text-align:center;
                        border-top:1px solid #1e293b;">
              <p style="color:#475569;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} FinTrack Pro · Expense Tracker
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: `"FinTrack Pro" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✉  OTP email sent to ${toEmail} → Message ID: ${info.messageId}`);
  return info;
};

module.exports = { sendOTPEmail };
