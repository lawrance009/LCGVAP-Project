const jwt = require('jsonwebtoken');

const FILE_ACCESS_TTL_SECONDS = 300; // 5 minutes

const getSecret = () => {
  return process.env.FILE_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET;
};

const signFileAccessToken = ({ filename, userId, role }) => {
  return jwt.sign(
    { filename, uid: userId, role, typ: 'file_access' },
    getSecret(),
    { expiresIn: FILE_ACCESS_TTL_SECONDS }
  );
};

const verifyFileAccessToken = (token) => {
  return jwt.verify(token, getSecret());
};

module.exports = {
  FILE_ACCESS_TTL_SECONDS,
  signFileAccessToken,
  verifyFileAccessToken,
};
