/**
 * Shared SMTP transport for Railway.
 * Gmail app passwords often fail on cloud hosts — set SMTP_HOST for Brevo etc.
 */
const nodemailer = require('nodemailer');
const logger = require('./logger');

const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID
);
const isProduction = process.env.NODE_ENV === 'production' || onRailway;

let lastVerifyResult = { ok: null, reason: null };

const getEmailCredentials = () => {
  const user = process.env.EMAIL_USER?.trim() || '';
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();
  return { user, pass };
};

const getFromAddress = () =>
  process.env.EMAIL_FROM?.trim() || getEmailCredentials().user;

const isEmailConfigured = () => {
  const { user, pass } = getEmailCredentials();
  return Boolean(user && pass);
};

const getSmtpConfig = () => {
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT) || 587;
    return {
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
    };
  }

  // Default Gmail — try 465 (SSL) which is more reliable on Railway than 587
  const use465 = process.env.SMTP_PORT !== '587';
  return {
    host: 'smtp.gmail.com',
    port: use465 ? 465 : 587,
    secure: use465,
  };
};

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { user, pass } = getEmailCredentials();
  if (!user || !pass) return null;

  const smtp = getSmtpConfig();
  transporter = nodemailer.createTransport({
    ...smtp,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' },
  });

  return transporter;
};

const getEmailStatus = () => ({
  configured: isEmailConfigured(),
  smtp_ok: lastVerifyResult.ok,
  smtp_error: lastVerifyResult.ok === false ? lastVerifyResult.reason : null,
  host: getSmtpConfig().host,
  from: getFromAddress(),
});

const verifyMailTransport = async () => {
  if (!isEmailConfigured()) {
    const msg =
      'EMAIL_USER / EMAIL_PASS not set — emails will NOT send. ' +
      'Railway backend needs EMAIL_USER + EMAIL_PASS (or Brevo SMTP — see DEPLOYMENT.md).';
    lastVerifyResult = { ok: false, reason: 'not_configured' };
    if (isProduction) logger.error(msg);
    else logger.warn(msg);
    return lastVerifyResult;
  }

  const smtp = getSmtpConfig();
  const { user } = getEmailCredentials();

  try {
    const t = getTransporter();
    await t.verify();
    lastVerifyResult = { ok: true, reason: null };
    logger.info(
      `SMTP connection verified (host=${smtp.host}, port=${smtp.port}, user=${user})`
    );
    return lastVerifyResult;
  } catch (err) {
    const detail = err.message || String(err);
    lastVerifyResult = { ok: false, reason: detail };
    logger.error(`SMTP verification FAILED: ${detail}`);
    logger.error(
      `SMTP config: host=${smtp.host} port=${smtp.port} user=${user} — ` +
      'Gmail? Use App Password + 2FA. Still failing? Switch to Brevo (free) in DEPLOYMENT.md'
    );
    return lastVerifyResult;
  }
};

const sendMailMessage = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    if (isProduction) {
      throw new Error(
        'Email not configured. Set EMAIL_USER and EMAIL_PASS on the Railway backend service.'
      );
    }
    logger.warn('EMAIL_USER or EMAIL_PASS not set. Simulating email send.');
    return { message: 'Email simulated (no SMTP credentials).' };
  }

  const t = getTransporter();
  return t.sendMail({ from: getFromAddress(), to, subject, text, html });
};

module.exports = {
  getEmailCredentials,
  getFromAddress,
  isEmailConfigured,
  getEmailStatus,
  getTransporter,
  verifyMailTransport,
  sendMailMessage,
};
