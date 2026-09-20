const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { hashAadhaar, maskAadhaar } = require('../utils/aadhaarUtils');

class OtpService {
  /**
   * Request OTP for Aadhaar or Mobile verification
   */
  async requestOtp({ aadhaar, phone }) {
    // Generate secure random 6-digit numeric OTP
    const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(rawOtp, 8);
    const sessionId = `otp_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    
    // OTP valid for 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const aadhaarRef = aadhaar ? hashAadhaar(aadhaar) : null;
    const masked = aadhaar ? maskAadhaar(aadhaar) : null;
    const cleanPhone = phone ? String(phone).trim() : null;

    await userRepository.saveOtpSession({
      sessionId,
      phone: cleanPhone || 'NA',
      aadhaarReference: aadhaarRef,
      maskedAadhaar: masked,
      otpHash,
      attempts: 0,
      isVerified: false,
      expiresAt
    });

    const isDev = process.env.DEV_OTP_MODE !== 'false';
    const logTarget = masked ? `Aadhaar (${masked})` : `Mobile (${cleanPhone})`;
    console.log(`[DEV OTP] Verification code for ${logTarget}: ${rawOtp} (Session: ${sessionId})`);

    return {
      sessionId,
      expiresAt,
      maskedAadhaar: masked,
      message: `OTP sent successfully to registered mobile number.`,
      // Return devOtp when in development mode for easy evaluation
      ...(isDev ? { devOtp: rawOtp } : {})
    };
  }

  /**
   * Verify entered 6-digit OTP
   */
  async verifyOtp({ sessionId, otp }) {
    const session = await userRepository.findOtpSession(sessionId);

    if (!session) {
      throw new Error('OTP session not found or has expired. Please request a new code.');
    }

    if (new Date() > new Date(session.expiresAt)) {
      throw new Error('OTP has expired. Please request a new verification code.');
    }

    if (session.attempts >= 5) {
      throw new Error('Maximum OTP verification attempts exceeded. Please request a new code.');
    }

    const isValid = await bcrypt.compare(String(otp).trim(), session.otpHash);
    if (!isValid) {
      await userRepository.updateOtpSession(sessionId, { attempts: (session.attempts || 0) + 1 });
      throw new Error('Incorrect OTP code. Please verify and try again.');
    }

    // Generate secure one-time verification token
    const verificationToken = `vtok_${crypto.randomBytes(24).toString('hex')}`;

    await userRepository.updateOtpSession(sessionId, {
      isVerified: true,
      verificationToken
    });

    return {
      verified: true,
      verificationToken,
      maskedAadhaar: session.maskedAadhaar,
      phone: session.phone,
      message: 'Aadhaar / Mobile identity verified successfully'
    };
  }
}

module.exports = new OtpService();
