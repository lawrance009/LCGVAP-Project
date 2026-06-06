const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '../../.env');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Generate new 64-byte random hex strings
  const newAccessSecret = crypto.randomBytes(64).toString('hex');
  const newRefreshSecret = crypto.randomBytes(64).toString('hex');
  const newAdminSecret = crypto.randomBytes(32).toString('hex'); // 32 bytes is enough for this

  // Replace secrets in the file
  envContent = envContent.replace(
    /JWT_ACCESS_SECRET=.*/,
    `JWT_ACCESS_SECRET=${newAccessSecret}`
  );
  envContent = envContent.replace(
    /JWT_REFRESH_SECRET=.*/,
    `JWT_REFRESH_SECRET=${newRefreshSecret}`
  );
  envContent = envContent.replace(
    /ADMIN_CREATION_SECRET=.*/,
    `ADMIN_CREATION_SECRET=${newAdminSecret}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log('Successfully rotated all JWT and Admin secrets in .env file.');
  
  // Also log the admin creation secret so the user knows it
  console.log('\\n--- IMPORTANT ---');
  console.log('Your new ADMIN_CREATION_SECRET is:');
  console.log(newAdminSecret);
  console.log('Keep this safe! You will need it to create the first Master Admin.');
  console.log('-----------------\\n');

} catch (error) {
  console.error('Failed to rotate credentials:', error);
}
