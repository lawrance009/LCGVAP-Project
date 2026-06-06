const sanitizeUserForClient = (user) => {
  if (!user) return null;

  const safeUser = { ...user };
  delete safeUser.password;
  delete safeUser.password_hash;
  delete safeUser.passport_number;
  delete safeUser.date_of_birth;

  return safeUser;
};

module.exports = {
  sanitizeUserForClient,
};
