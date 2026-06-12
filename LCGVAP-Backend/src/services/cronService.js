const cron = require('node-cron');
const newsModel = require('../models/newsModel');
const emailService = require('../utils/emailService');
const BRAND = require('../constants/branding');

const checkBirthdays = async () => {
  console.log('Running Birthday Check...');
  try {
    const celebrants = await newsModel.getTodaysBirthdays();

    if (celebrants.length === 0) {
      console.log('No birthdays today.');
      return;
    }

    console.log(`Found ${celebrants.length} birthdays today! Sending emails...`);

    // Get Total Verified Count for "1 of X Verified Graduates"
    // We can fetch this from dashboard stats or just a simple query
    // Since we don't have direct access to userModel here easily without importing multiple,
    // let's just do a quick count via newsModel or similar if possible.
    // Or better, let's keep it simple and fetch it via a helper if needed, 
    // but for now, we can hardcode or skip dynamic total if query is complex.
    // Actually, we can use DB directly inside cronService for a quick count.
    // However, let's assume we can add `getVerifiedCount` to newsModel or just import userModel.
    // Let's import userModel for the stats.
    const userModel = require('../models/userModel');
    const stats = await userModel.getDashboardStats();
    const totalVerified = stats.verified;

    for (const user of celebrants) {
      const subject = `Happy Birthday from ${BRAND.shortName}! 🎉`;
      const currentYear = new Date().getFullYear();

      // Construct HTML with replacements
      // Defaulting GRAD_YEAR to "Unknown" if not strictly tracked, or omitting class info if data missing.
      // We'll use created_at year as a proxy for "Class of" if grad year isn't verified, 
      // OR just genericize it if we prefer accuracy. 
      // Template asked for "Class of {{GRAD_YEAR}}". user.created_at is registration, not grad.
      // Let's use "Unknown" or just empty string contextually? 
      // Better: Let's remove "Class of {{GRAD_YEAR}}" if we don't have it, to avoid "Class of 2024" for a 2010 grad.
      // But the user requested it. Let's assume for now we use 'N/A' or 'Unknown' until we add that field.
      // Actually, let's just use "Verified Member" instead of "Class of..." if we can't find it.
      // **Waiting**: The prompt didn't ask to ADD the column, just gave the template.
      // I will placeholder it with "Alumni".

      const gradYear = "Alumni"; // Placeholder

      let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Happy Birthday from ${BRAND.shortName}</title>
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
                ${BRAND.portalName}<br><span style="font-size:13px;font-weight:normal;opacity:0.9">${BRAND.fullName}</span>
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <p style="font-size:16px;color:#333;">
                Dear ${user.first_name},
              </p>
              <p style="font-size:16px;color:#444;line-height:1.7;">
                Today, we celebrate not only your birthday, but the remarkable journey
                you began as a proud graduate of <strong>${user.university_name || 'Northern Cyprus'}</strong>.
              </p>
              <div style="margin:30px 0;text-align:center;">
                <h2 style="color:#0f172a;font-size:26px;margin:0;">
                  🎉 Happy Birthday! 🎉
                </h2>
              </div>
              <p style="font-size:16px;color:#444;line-height:1.7;">
                As a verified member of ${BRAND.shortName}, you are part of something larger —
                a growing and powerful network of Liberian graduates who studied in Northern Cyprus
                and continue to impact communities across the world.
              </p>
              <div style="background:#f1f5f9;padding:20px;border-radius:6px;margin:25px 0;text-align:center;">
                <p style="font-size:15px;color:#0f172a;margin:0;">
                  You are 1 of <strong>${totalVerified}</strong> verified graduates
                  strengthening our global alumni network.
                </p>
              </div>
              <p style="font-size:15px;color:#555;line-height:1.7;">
                Your presence strengthens our family. Your journey inspires others.
                Your achievements reflect the resilience and excellence of our community.
              </p>
              <p style="font-size:15px;color:#555;line-height:1.7;">
                May this new year bring continued growth, opportunity, purpose,
                and fulfillment. ${BRAND.shortName} stands with you — not only today,
                but for a lifetime.
              </p>
              <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;" />
              <p style="font-size:14px;color:#777;">
                With appreciation and pride,
                <br><br>
                <strong>The ${BRAND.shortName} Team</strong>
                <br>
                A Lifelong Community of Verified Graduates
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#777;">
              © ${currentYear} ${BRAND.portalName}
              <br>
              Building a Stronger Alumni Family, Together.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const text = `Happy Birthday ${user.first_name}! From ${BRAND.shortName}.`;

      try {
        await emailService.sendEmail(user.email, subject, text, htmlContent);
        console.log(`Birthday email sent to ${user.email}`);
      } catch (emailErr) {
        console.error(`Failed to send birthday email to ${user.email}:`, emailErr);
      }
    }
  } catch (error) {
    console.error('Error in birthday check:', error);
  }
};

const initCronJobs = () => {
  // Run at 9:00 AM every day
  // Cron syntax: Minute Hour Day Month DayOfWeek
  cron.schedule('0 9 * * *', async () => {
    console.log('Running Daily Birthday Cron Job...');
    await checkBirthdays();
  });

  console.log('✅ Cron Service Initialized (Daily 9:00 AM check)');
};

module.exports = { initCronJobs, checkBirthdays };
