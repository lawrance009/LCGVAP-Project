/**
 * Shared SMTP transport for Railway / Gmail.
 * Strips spaces from app passwords and verifies connection on startup.
 */
const nodemailer = require('nodemailer');
const logger = require('./logger');

const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID
);
const isProduction = process.env.NODE_ENV === 'production' || onRailway;

const getEmailCredentials = () => {
  const user = process.env.EMAIL_USER?.trim() || '';
  // Gmail app passwords are often copied with spaces — strip them.
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();
  return { user, pass };
};

const isEmailConfigured = () => {
  const { user, pass } = getEmailCredentials();
  return Boolean(user && pass);
};

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { user, pass } = getEmailCredentials();
  if (!user || !pass) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' },
  });

  return transporter;
};

const verifyMailTransport = async () => {
  if (!isEmailConfigured()) {
    const msg =
      'EMAIL_USER / EMAIL_PASS not set on backend — emails will NOT send. ' +
      'Railway: add variables named exactly EMAIL_USER and EMAIL_PASS, then redeploy.';
    if (isProduction) logger.error(msg);
    else logger.warn(msg);
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const t = getTransporter();
    await t.verify();
    logger.info('SMTP connection verified', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      user: getEmailCredentials().user,
    });
    return { ok: true };
  } catch (err) {
    logger.error('SMTP verification failed — check EMAIL_USER and EMAIL_PASS (Gmail app password, 2FA on)', {
      error: err.message,
    });
    return { ok: false, reason: err.message };
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

  const { user } = getEmailCredentials();
  const t = getTransporter();
  return t.sendMail({ from: user, to, subject, text, html });
};

module.exports = {
  getEmailCredentials,
  isEmailConfigured,
  getTransporter,
  verifyMailTransport,
  sendMailMessage,
};
