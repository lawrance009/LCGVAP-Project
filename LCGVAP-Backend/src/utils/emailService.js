const { Queue } = require('bullmq');
const { redisClient, isRedisReady } = require('../config/redis');
const logger = require('./logger');
const nodemailer = require('nodemailer');

let emailQueue = null;

const getEmailQueue = () => {
  if (!emailQueue && redisClient && isRedisReady()) {
    emailQueue = new Queue('emailQueue', { connection: redisClient });
  }
  return emailQueue;
};
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text, html) => {
  const sendDirect = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('EMAIL_USER or EMAIL_PASS not set. Simulating direct email send.');
      return { message: 'Email simulated (no SMTP credentials).' };
    }
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    });
    return { message: 'Email sent directly (Redis fail-soft mode).' };
  };

  if (!isRedisReady()) {
    logger.warn(`Redis unavailable; sending email directly to ${to}`);
    return sendDirect();
  }

  const queue = getEmailQueue();
  if (!queue) {
    logger.warn(`Redis queue unavailable; sending email directly to ${to}`);
    return sendDirect();
  }

  try {
    // Push the email job to the Redis queue
    // The worker (src/workers/emailWorker.js) will pick it up and actually send it
    const job = await queue.add('sendEmail', {
      to,
      subject,
      text,
      html
    }, {
      attempts: 3, // Retry up to 3 times if it fails
      backoff: {
        type: 'exponential',
        delay: 5000 // Wait 5s, 25s, 125s between retries
      }
    });

    logger.info(`Email job ${job.id} added to queue for ${to}`);
    return { jobId: job.id, message: 'Email queued successfully' };
  } catch (error) {
    logger.error('Failed to add email to queue', { error: error.message });
    logger.warn(`Falling back to direct email send for ${to}`);
    return sendDirect();
  }
};


const sendOtpEmail = async (to, name, otp, expiryMinutes = 10) => {
  // ... existing OTP email code ...
  const subject = 'LCGVAP Login Verification Code';
  const text = `Hello ${name},\n\nYour LCGVAP verification code is: ${otp}\nIt expires in ${expiryMinutes} minutes.\n\nIf you did not request this, please ignore this email.`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>LCGVAP Login Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:20px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:20px;">
                Liberian Cyprus Graduates Veteran Alumni Portal
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">

              <p style="font-size:16px;color:#333;">
                Hello ${name},
              </p>

              <p style="font-size:15px;color:#555;line-height:1.6;">
                We received a request to log in to your LCGVAP account.
                Please use the verification code below to complete your login.
              </p>

              <!-- OTP BOX -->
              <div style="text-align:center;margin:30px 0;">
                <div style="display:inline-block;background:#f1f5f9;padding:20px 40px;border-radius:6px;">
                  <span style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#0f172a;">
                    ${otp}
                  </span>
                </div>
              </div>

              <p style="font-size:14px;color:#555;">
                This code will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>

              <p style="font-size:14px;color:#777;line-height:1.6;">
                If you did not request this login, please ignore this email.
                Your account remains secure.
              </p>

              <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;" />

              <p style="font-size:12px;color:#999;">
                For security reasons:
                <br>
                • Do not share this code with anyone.
                <br>
                • LCGVAP administrators will never ask for your OTP.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#777;">
              © 2026 Liberian Cyprus Graduates Veteran Alumni Portal (LCGVAP)
              <br>
              Secure Identity Verification Platform
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  return sendEmail(to, subject, text, html);
};

const sendRegistrationAckEmail = async (to, name) => {
  const subject = 'Registration Received — Verification Pending';
  const text = `Dear ${name},\n\nWe warmly acknowledge the successful submission of your registration to the Liberian Cyprus Graduates Veteran Alumni Portal (LCGVAP).\n\nAt this time, your application status is marked as Pending Verification.\n\nPlease note that registration does not automatically confirm membership. Our administrative team will carefully review your submitted information and academic credentials to ensure the integrity and authenticity of our community.\n\nOnce your profile has been reviewed and verified, you will receive a formal confirmation email.\n\n*** IMPORTANT: You will not be able to log into your account to request an OTP until you receive that confirmation email. ***\n\nWe sincerely appreciate your patience during this process.\n\nLCGVAP remains committed to building a credible and trusted network of Liberian graduates in Cyprus and beyond.\n\nWith respect,\n\nLCGVAP Administration`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Registration Pending</title></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border-top: 4px solid #f59e0b;">
<tr><td style="padding:40px;">
<h2 style="color:#111827;font-size:24px;margin-bottom:20px;">Registration Received</h2>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">Dear ${name},</p>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">We warmly acknowledge the successful submission of your registration to the Liberian Cyprus Graduates Veteran Alumni Portal (LCGVAP).</p>
<div style="background-color:#fffbeb;border:1px solid #fcd34d;padding:15px;border-radius:6px;margin:20px 0;">
<p style="margin:0;color:#92400e;font-weight:bold;">Status: Pending Verification</p>
</div>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">Please note that registration does not automatically confirm membership. Our administrative team will carefully review your submitted information and academic credentials to ensure the integrity and authenticity of our community.</p>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">Once your profile has been reviewed and verified, you will receive a formal confirmation email.</p>

<div style="background-color:#fee2e2;border-left:4px solid #ef4444;padding:15px;margin:25px 0;">
  <p style="margin:0;color:#991b1b;font-weight:bold;font-size:15px;">
    IMPORTANT: You will not be able to log into your account to request an OTP until you receive your final confirmation email.
  </p>
</div>

<p style="font-size:16px;color:#4b5563;line-height:1.6;">We sincerely appreciate your patience during this process.</p>
<hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;" />
<p style="font-size:14px;color:#6b7280;">With respect,<br><strong>LCGVAP Administration</strong><br>Liberian Cyprus Graduates Veteran Alumni Portal</p>
</td></tr></table></td></tr></table></body></html>`;

  return sendEmail(to, subject, text, html);
};

const sendVerificationEmail = async (to, name, university, graduationYear, totalVerified) => {
  const subject = 'Congratulations — You Are Now a Verified Member of LCGVAP';
  const text = `Dear ${name},\n\nWe are pleased to inform you that your profile has been successfully reviewed and verified by the LCGVAP Administration.\n\nAs a graduate of ${university}, Class of ${graduationYear}, you are now officially recognized as a Verified Member of the Liberian Cyprus Graduates Veteran Alumni Portal.\n\nYour verification confirms that your credentials have been validated and your membership is formally acknowledged within our growing network.\n\nYou are now part of a trusted community of professionals strengthening collaboration, legacy, and opportunity among Liberian graduates.\n\nYou are 1 of ${totalVerified} verified graduates strengthening this network.\n\nWelcome to the family.\nLCGVAP stands with you — today and always.\n\nWith pride and respect,\n\nLCGVAP Administration`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Verification Approved</title></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border-top: 4px solid #10b981;">
<tr><td style="padding:40px;">
<h2 style="color:#111827;font-size:24px;margin-bottom:20px;">Congratulations!</h2>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">Dear ${name},</p>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">We are pleased to inform you that your profile has been successfully reviewed and verified by the LCGVAP Administration.</p>
<div style="background-color:#ecfdf5;border:1px solid #6ee7b7;padding:20px;border-radius:6px;margin:25px 0;text-align:center;">
<p style="margin:0 0 5px 0;color:#065f46;font-size:18px;font-weight:bold;">Verified Member</p>
<p style="margin:0;color:#047857;">${university} • Class of ${graduationYear}</p>
</div>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">Your verification confirms that your credentials have been validated and your membership is formally acknowledged within our growing network.</p>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">You are 1 of <strong>${totalVerified}</strong> verified graduates strengthening this network.</p>
<p style="font-size:16px;color:#4b5563;line-height:1.6;font-weight:bold;">Welcome to the family.<br>LCGVAP stands with you — today and always.</p>
<hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;" />
<p style="font-size:14px;color:#6b7280;">With pride and respect,<br><strong>LCGVAP Administration</strong><br>Liberian Cyprus Graduates Veteran Alumni Portal</p>
</td></tr></table></td></tr></table></body></html>`;

  return sendEmail(to, subject, text, html);
};

const sendRejectionEmail = async (to, name, reason) => {
  const subject = 'Update Regarding Your LCGVAP Verification Status';
  const text = `Dear ${name},\n\nWe are sorry, we found that you can't be verified at the moment. Please look at the verification process on the landing page of our website.\n\nWe are strict about this. We just noticed that you are not a graduate or it could be for another issue.\n\nReason for Rejection: ${reason}\n\nWith respect,\n\nLCGVAP Administration`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Verification Status Update</title></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border-top: 4px solid #ef4444;">
<tr><td style="padding:40px;">
<h2 style="color:#111827;font-size:24px;margin-bottom:20px;">Application Status Update</h2>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">Dear ${name},</p>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">We are sorry, we found that you can't be verified at the moment. Please look at the verification process on the landing page of our website.</p>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">We are strict about this. We just noticed that you are not a graduate or it could be for another issue.</p>
<div style="background-color:#fef2f2;border:1px solid #fca5a5;padding:15px;border-radius:6px;margin:20px 0;">
<p style="margin:0 0 5px 0;color:#991b1b;font-weight:bold;">Reason for Rejection:</p>
<p style="margin:0;color:#7f1d1d;">${reason}</p>
</div>
<hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;" />
<p style="font-size:14px;color:#6b7280;">With respect,<br><strong>LCGVAP Administration</strong><br>Liberian Cyprus Graduates Veteran Alumni Portal</p>
</td></tr></table></td></tr></table></body></html>`;

  return sendEmail(to, subject, text, html);
};

const sendRejectionPurgeEmail = async (to, name, reason) => {
  const subject = 'LCGVAP Application Declined — Account Removed';
  const text = `Dear ${name},

Your recent LCGVAP registration could not be approved after verification review.

Reason:
${reason}

For your security, your current account and active session have been fully removed from our system.

If you correct the issue and have the right information/documents, you can register again using the same email.
Your next registration must use a valid email format.

With respect,
LCGVAP Administration`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Application Declined</title></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border-top:4px solid #ef4444;">
<tr><td style="padding:40px;">
<h2 style="color:#111827;font-size:24px;margin-bottom:20px;">Application Declined</h2>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">Dear ${name},</p>
<p style="font-size:16px;color:#4b5563;line-height:1.6;">Your recent LCGVAP registration could not be approved after verification review.</p>

<div style="background-color:#fef2f2;border:1px solid #fca5a5;padding:15px;border-radius:6px;margin:20px 0;">
  <p style="margin:0 0 5px 0;color:#991b1b;font-weight:bold;">Reason:</p>
  <p style="margin:0;color:#7f1d1d;">${reason}</p>
</div>

<div style="background-color:#fff7ed;border:1px solid #fdba74;padding:15px;border-radius:6px;margin:20px 0;">
  <p style="margin:0;color:#9a3412;font-weight:bold;">Security Action Completed</p>
  <p style="margin:8px 0 0 0;color:#9a3412;">
    Your account and active session have been removed from the system.
  </p>
</div>

<p style="font-size:16px;color:#4b5563;line-height:1.6;">
  If you correct the issue and have the right documents, you may register again using the same email.
</p>
<p style="font-size:14px;color:#6b7280;line-height:1.6;">
  Note: Your next registration must use a valid email format.
</p>

<hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;" />
<p style="font-size:14px;color:#6b7280;">With respect,<br><strong>LCGVAP Administration</strong><br>Liberian Cyprus Graduates Veteran Alumni Portal</p>
</td></tr></table></td></tr></table></body></html>`;

  return sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendRegistrationAckEmail,
  sendVerificationEmail,
  sendRejectionEmail,
  sendRejectionPurgeEmail
};
