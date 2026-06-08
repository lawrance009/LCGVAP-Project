const fs = require('fs');
const path = require('path');

const UPLOAD_SUBDIRS = [
  'uploads',
  'uploads/slides',
  'uploads/universities',
  'uploads/graduates',
  'uploads/logs',
];

/** Create upload folders on boot (required for Railway volume mount at /app/uploads). */
const ensureUploadDirs = () => {
  for (const dir of UPLOAD_SUBDIRS) {
    const fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
};

module.exports = { ensureUploadDirs };
