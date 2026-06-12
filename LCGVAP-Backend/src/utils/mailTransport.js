/**
 * Email delivery for Railway + local dev.
 *
 * Railway Hobby/Trial blocks outbound SMTP (ports 465/587) — Connection timeout.
 * Use BREVO_API_KEY (HTTPS API on port 443) on Railway; SMTP works on Railway Pro+.
 */
const nodemailer = require('nodemailer');
const logger = require('./logger');

const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID
);
const isProduction = process.env.NODE_ENV === 'production' || onRailway;

let lastVerifyResult = { ok: null, reason: null, transport: null };

const getBrevoApiKey = () => process.env.BREVO_API_KEY?.trim() || '';

const useBrevoApi = () => Boolean(getBrevoApiKey());

const getEmailCredentials = () => {
  const user = process.env.EMAIL_USER?.trim() || '';
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();
  return { user, pass };
};

const getFromAddress = () =>
  process.env.EMAIL_FROM?.trim() || getEmailCredentials().user;

const getFromName = () =>
  process.env.EMAIL_FROM_NAME?.trim() || 'VCLGC Alumni Portal';

const isEmailConfigured = () => {
  if (useBrevoApi()) {
    return Boolean(getBrevoApiKey() && getFromAddress());
  }
  const { user, pass } = getEmailCredentials();
  return Boolean(user && pass);
};

const getTransportLabel = () => (useBrevoApi() ? 'brevo_api' : 'smtp');

const getSmtpConfig = () => {
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT) || 587;
    return {
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
    };
  }

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
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
};

const getEmailStatus = () => ({
  configured: isEmailConfigured(),
  transport: getTransportLabel(),
  smtp_ok: lastVerifyResult.ok,
  smtp_error: lastVerifyResult.ok === false ? lastVerifyResult.reason : null,
  host: useBrevoApi() ? 'api.brevo.com' : getSmtpConfig().host,
  from: getFromAddress(),
});

const verifyBrevoApi = async () => {
  const response = await fetch('https://api.brevo.com/v3/account', {
    headers: {
      accept: 'application/json',
      'api-key': getBrevoApiKey(),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo API check failed (${response.status}): ${detail}`);
  }

  return response.json();
};

const verifyMailTransport = async () => {
  if (!isEmailConfigured()) {
    const msg =
      'Email not configured. On Railway Hobby, set BREVO_API_KEY + EMAIL_FROM ' +
      '(see DEPLOYMENT.md). Or use EMAIL_USER + EMAIL_PASS on Railway Pro for SMTP.';
    lastVerifyResult = { ok: false, reason: 'not_configured', transport: null };
    if (isProduction) logger.error(msg);
    else logger.warn(msg);
    return lastVerifyResult;
  }

  if (useBrevoApi()) {
    try {
      await verifyBrevoApi();
      lastVerifyResult = { ok: true, reason: null, transport: 'brevo_api' };
      logger.info(
        `Brevo API verified (from=${getFromAddress()}, transport=HTTPS — works on Railway Hobby)`
      );
      return lastVerifyResult;
    } catch (err) {
      const detail = err.message || String(err);
      lastVerifyResult = { ok: false, reason: detail, transport: 'brevo_api' };
      logger.error(`Brevo API verification FAILED: ${detail}`);
      logger.error(
        'Check BREVO_API_KEY in Railway variables and verify EMAIL_FROM in Brevo → Senders.'
      );
      return lastVerifyResult;
    }
  }

  const smtp = getSmtpConfig();
  const { user } = getEmailCredentials();

  try {
    const t = getTransporter();
    await t.verify();
    lastVerifyResult = { ok: true, reason: null, transport: 'smtp' };
    logger.info(
      `SMTP connection verified (host=${smtp.host}, port=${smtp.port}, user=${user})`
    );
    return lastVerifyResult;
  } catch (err) {
    const detail = err.message || String(err);
    lastVerifyResult = { ok: false, reason: detail, transport: 'smtp' };
    logger.error(`SMTP verification FAILED: ${detail}`);
    logger.error(
      `SMTP config: host=${smtp.host} port=${smtp.port} user=${user}. ` +
      'Connection timeout on Railway Hobby? SMTP is blocked — use BREVO_API_KEY instead (DEPLOYMENT.md). ' +
      'On Railway Pro, redeploy after upgrading; Gmail needs App Password + 2FA.'
    );
    return lastVerifyResult;
  }
};

const sendViaBrevoApi = async ({ to, subject, text, html }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': getBrevoApiKey(),
    },
    body: JSON.stringify({
      sender: { name: getFromName(), email: getFromAddress() },
      to: [{ email: to }],
      subject,
      htmlContent: html || undefined,
      textContent: text || undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo send failed (${response.status}): ${detail}`);
  }

  return response.json();
};

const sendMailMessage = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    if (isProduction) {
      throw new Error(
        'Email not configured. Set BREVO_API_KEY + EMAIL_FROM on Railway (Hobby), ' +
        'or EMAIL_USER + EMAIL_PASS on Railway Pro.'
      );
    }
    logger.warn('Email not configured. Simulating email send.');
    return { message: 'Email simulated (no credentials).' };
  }

  if (useBrevoApi()) {
    return sendViaBrevoApi({ to, subject, text, html });
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
