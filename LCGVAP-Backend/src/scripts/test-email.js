/**
 * Test email credentials locally before Railway deploy.
 *
 * Railway Hobby (recommended — HTTPS, not blocked):
 *   $env:BREVO_API_KEY="xkeysib-..."
 *   $env:EMAIL_FROM="verified@gmail.com"
 *   npm run email:test
 *
 * Local SMTP (Gmail App Password):
 *   $env:EMAIL_USER="you@gmail.com"
 *   $env:EMAIL_PASS="your-app-password"
 *   npm run email:test
 */
require('dotenv').config();

const BRAND = require('../constants/branding');
const { verifyMailTransport, sendMailMessage } = require('../utils/mailTransport');

const to = process.argv[2]?.trim() || process.env.EMAIL_USER || process.env.EMAIL_FROM;

(async () => {
  console.log('Testing email...');
  console.log('  BREVO_API_KEY:', process.env.BREVO_API_KEY ? '(set)' : '(not set)');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || process.env.EMAIL_USER || '(not set)');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST || (process.env.BREVO_API_KEY ? 'api.brevo.com (API)' : 'smtp.gmail.com (default)'));

  const result = await verifyMailTransport();
  if (!result.ok) {
    console.error('\nFAILED:', result.reason);
    console.error('\nRailway Hobby blocks SMTP. Use BREVO_API_KEY — see DEPLOYMENT.md');
    process.exit(1);
  }

  console.log(`\nOK via ${result.transport || 'email'}`);

  if (!to) {
    console.log('Pass an email as first argument to send a test message.');
    process.exit(0);
  }

  await sendMailMessage({
    to,
    subject: `${BRAND.shortName} email test`,
    text: 'If you received this, email is working.',
    html: '<p>If you received this, <strong>email is working</strong>.</p>',
  });

  console.log(`Test email sent to ${to}`);
})();
