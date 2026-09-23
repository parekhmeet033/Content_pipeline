const bcrypt = require('bcrypt');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

function hashValue(value) {
  return bcrypt.hash(value, SALT_ROUNDS);
}

function compareValue(value, hash) {
  if (!value || !hash) return Promise.resolve(false);
  return bcrypt.compare(value, hash);
}

module.exports = { hashValue, compareValue };
