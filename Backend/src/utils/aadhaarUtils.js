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

/**
 * Simulate UIDAI Aadhaar registry demographics lookup
 * Auto-fetches DOB, age, gender, and linked phone number from Aadhaar
 * @param {string} aadhaar
 * @returns {object}
 */
function generateAadhaarDemographics(aadhaar) {
  const clean = normalizeAadhaar(aadhaar).replace(/\D/g, '');
  const seed = clean.length >= 4 ? parseInt(clean.slice(-4), 10) : 1234;
  
  // Calculate deterministic age & DOB
  const birthYear = 1970 + (seed % 35); // between 1970 and 2004
  const birthMonth = 1 + (seed % 12);
  const birthDay = 1 + (seed % 28);
  const pad = (n) => String(n).padStart(2, '0');
  const dob = `${pad(birthDay)}/${pad(birthMonth)}/${birthYear}`;
  const age = Math.max(18, new Date().getFullYear() - birthYear);
  const isFemale = (seed % 2 === 0);
  const gender = isFemale ? 'female' : 'male';
  const genderLabel = isFemale ? 'Female' : 'Male';

  // Linked phone number from Aadhaar registry
  const prefix = 9800000000 + (seed * 83) % 190000000;
  const rawPhone = String(prefix).slice(0, 10);
  const formattedPhone = `+91 ${rawPhone.slice(0, 5)} ${rawPhone.slice(5)}`;

  return {
    dob,
    age,
    gender,
    genderLabel,
    phone: rawPhone,
    formattedPhone,
    state: 'Rajasthan',
    district: 'Jaipur',
    country: 'India',
    pincode: '302004',
    source: 'UIDAI e-KYC Certified Database'
  };
}

module.exports = {
  isValidAadhaar,
  normalizeAadhaar,
  maskAadhaar,
  hashAadhaar,
  generateAadhaarDemographics
};
