/**
 * Test SMTP credentials locally before Railway deploy.
 *
 * PowerShell:
 *   cd LCGVAP-Backend
 *   $env:EMAIL_USER="you@gmail.com"
 *   $env:EMAIL_PASS="your-app-password"
 *   npm run email:test
 *
 * Optional (Brevo etc.):
 *   $env:SMTP_HOST="smtp-relay.brevo.com"
 *   $env:SMTP_PORT="587"
 */
require('dotenv').config();

const { verifyMailTransport, sendMailMessage } = require('../utils/mailTransport');

const to = process.argv[2]?.trim() || process.env.EMAIL_USER;

(async () => {
  console.log('Testing SMTP...');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER || '(not set)');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com (default)');

  const result = await verifyMailTransport();
  if (!result.ok) {
    console.error('\nFAILED:', result.reason);
    console.error('\nIf Gmail keeps failing on Railway, use Brevo (free) — see DEPLOYMENT.md');
    process.exit(1);
  }

  if (!to) {
    console.log('\nSMTP OK (no test recipient — pass an email as first argument to send a test message)');
    process.exit(0);
  }

  await sendMailMessage({
    to,
    subject: 'LCGVAP SMTP test',
    text: 'If you received this, email is working.',
    html: '<p>If you received this, <strong>email is working</strong>.</p>',
  });

  console.log(`\nTest email sent to ${to}`);
})();
