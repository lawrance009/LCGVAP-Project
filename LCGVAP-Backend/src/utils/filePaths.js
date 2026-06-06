const path = require('path');

const PRIVATE_PREFIX = '/private/';
const PUBLIC_PREFIX = '/uploads/';

const normalizeStoredPath = (inputPath) => {
  if (!inputPath) return null;

  // Accept full URL, /uploads/..., /private/... and extract relative filename
  const parsed = inputPath.split('?')[0];
  const privateIdx = parsed.indexOf(PRIVATE_PREFIX);
  if (privateIdx >= 0) {
    return parsed.slice(privateIdx + PRIVATE_PREFIX.length);
  }

  const publicIdx = parsed.indexOf(PUBLIC_PREFIX);
  if (publicIdx >= 0) {
    return parsed.slice(publicIdx + PUBLIC_PREFIX.length);
  }

  return path.basename(parsed);
};

const toPrivateUrl = (baseUrl, relativeFileName) => {
  return `${baseUrl}/private/${relativeFileName}`;
};

module.exports = {
  normalizeStoredPath,
  toPrivateUrl,
};
