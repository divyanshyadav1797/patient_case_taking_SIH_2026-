const crypto = require('crypto');

/**
 * Validate Aadhaar number format (must normalize to 12 digits)
 * @param {string} aadhaar
 * @returns {boolean}
 */
function isValidAadhaar(aadhaar) {
  if (!aadhaar) return false;
  const clean = String(aadhaar).replace(/\s+/g, '');
  return /^\d{12}$/.test(clean);
}

/**
 * Normalize Aadhaar to clean 12 digits
 * @param {string} aadhaar
 * @returns {string}
 */
function normalizeAadhaar(aadhaar) {
  if (!aadhaar) return '';
  return String(aadhaar).replace(/\s+/g, '');
}

/**
 * Mask Aadhaar number for display (e.g. XXXX XXXX 1234)
 * @param {string} aadhaar
 * @returns {string}
 */
function maskAadhaar(aadhaar) {
  const clean = normalizeAadhaar(aadhaar);
  if (clean.length < 4) return 'XXXX XXXX XXXX';
  const lastFour = clean.slice(-4);
  return `XXXX XXXX ${lastFour}`;
}

/**
 * Hash Aadhaar to create deterministic lookup reference without plaintext storage
 * @param {string} aadhaar
 * @returns {string}
 */
function hashAadhaar(aadhaar) {
  const clean = normalizeAadhaar(aadhaar);
  return crypto.createHash('sha256').update(`quantum_care_aadhaar_${clean}`).digest('hex');
}

module.exports = {
  isValidAadhaar,
  normalizeAadhaar,
  maskAadhaar,
  hashAadhaar
};
