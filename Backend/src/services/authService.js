const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const tokenRepository = require('../repositories/tokenRepository');
const otpService = require('./otpService');
const {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
} = require('../config/jwt');
const { hashAadhaar, maskAadhaar, isValidAadhaar, generateAadhaarDemographics } = require('../utils/aadhaarUtils');

class AuthService {
  /**
   * Universal Login across all roles (Patient, Doctor, Hospital, Kiosk, Admin)
   * Issued against MongoDB. Returns JWT Access Token + Refresh Token pair.
   */
  async login({ role, identifier, secret }) {
    if (!identifier) {
      throw new Error('Login identifier is required');
    }
    if (!secret) {
      throw new Error('Password or PIN is required');
    }

    let user = await userRepository.findRawByRoleAndIdentifier(role, identifier);

    // If logging into Kiosk mode, also allow Hospital Admin credentials to authorize the terminal
    if (!user && role === 'kiosk') {
      user = await userRepository.findRawByRoleAndIdentifier('hospital', identifier);
    }

    if (!user) {
      throw new Error(`No account found for ${role} with identifier '${identifier}'`);
    }

    if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
      throw new Error(`Account has been ${user.status.toLowerCase()}. Please contact administrator.`);
    }

    // Verify Password or PIN strictly using bcrypt
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(secret, user.passwordHash);
    }
    if (!isMatch && user.pinHash) {
      isMatch = await bcrypt.compare(secret, user.pinHash);
    }

    if (!isMatch) {
      throw new Error('Invalid password or PIN provided');
    }

    // Update last login timestamp in MongoDB
    await userRepository.updateUser(user._id || user.customId, {
      lastLoginAt: new Date().toISOString()
    });

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    delete safeUser.pinHash;
    delete safeUser.aadhaarReference;

    if (role === 'kiosk') {
      safeUser.role = 'kiosk';
      safeUser.hospitalName = user.name || user.hospitalDetails?.hospitalName || 'Affiliated Hospital';
      safeUser.hospitalId = user.customId || user._id?.toString();
      if (!safeUser.kioskDetails) {
        safeUser.kioskDetails = {
          terminalId: `KIOSK-${user.customId || 'TER'}`,
          hospitalId: safeUser.hospitalId,
          hospitalName: safeUser.hospitalName,
          location: 'Hospital Reception'
        };
      }
    }

    // Issue JWT Access + Refresh Token pair
    const tokenPair = generateTokenPair(safeUser);

    return {
      ...tokenPair,
      user: safeUser,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`
    };
  }

  /**
   * Universal Registration for Patient, Doctor, Hospital, Kiosk
   * Persists directly in MongoDB and issues JWT pair.
   */
  async register(validatedData) {
    const {
      role,
      name,
      email,
      phone,
      password,
      pin,
      aadhaar,
      aadhaarReference: existingAadhaarRef,
      maskedAadhaar: existingMaskedAadhaar,
      nmcId,
      hospitalRegNo,
      schemes,
      age,
      gender,
      bloodGroup,
      address,
      specialty,
      department,
      hospitalName,
      terminalId,
      hospitalId,
      location
    } = validatedData;

    let aadhaarReference = existingAadhaarRef;
    let maskedAadhaar = existingMaskedAadhaar;

    if (aadhaar && !aadhaarReference) {
      const cleanAadhaar = String(aadhaar).replace(/\D/g, '');
      if (cleanAadhaar.length === 12) {
        aadhaarReference = hashAadhaar(cleanAadhaar);
        maskedAadhaar = maskAadhaar(cleanAadhaar);
      }
    }

    // Check for uniqueness conflict in MongoDB
    const conflict = await userRepository.findExistingConflict({
      role,
      email,
      phone,
      aadhaarReference,
      nmcId,
      hospitalRegNo
    });

    if (conflict) {
      if (conflict.email && email && conflict.email.toLowerCase() === email.toLowerCase()) {
        throw new Error(`An account with email '${email}' already exists.`);
      }
      if (conflict.phone && phone && conflict.phone === phone) {
        throw new Error(`An account with phone number '${phone}' already exists.`);
      }
      if (aadhaarReference && conflict.aadhaarReference === aadhaarReference) {
        throw new Error('An account is already registered with this Aadhaar number.');
      }
      if (nmcId && conflict.doctorDetails?.nmcId === nmcId) {
        throw new Error(`Doctor with NMC ID '${nmcId}' is already registered.`);
      }
      if (hospitalRegNo && conflict.hospitalDetails?.hospitalRegNo === hospitalRegNo) {
        throw new Error(`Hospital with registration number '${hospitalRegNo}' already exists.`);
      }
      throw new Error('An account with these credentials already exists.');
    }

    // Hash password and PIN with bcrypt
    const secret = password || pin || '1234';
    const passwordHash = await bcrypt.hash(secret, 10);
    const pinHash = pin ? await bcrypt.hash(pin, 10) : passwordHash;

    const customIdPrefix = role.slice(0, 3).toUpperCase();
    const customId = `${customIdPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUserPayload = {
      customId,
      name,
      email: email ? email.toLowerCase() : null,
      phone: phone || null,
      passwordHash,
      pinHash,
      role,
      status: 'ACTIVE',
      aadhaarReference,
      maskedAadhaar,
      lastLoginAt: new Date().toISOString()
    };

    // Role-specific sub-schemas
    if (role === 'patient') {
      const rawAadhaar = validatedData.aadhaar || validatedData.aadhaarNum;
      const aadhaarDigits = rawAadhaar ? String(rawAadhaar).replace(/\D/g, '') : '';
      let derivedDemographics = {};
      if (aadhaarDigits.length === 12) {
        derivedDemographics = generateAadhaarDemographics(aadhaarDigits);
      }

      const finalAge = age ? Number(age) : (derivedDemographics.age || 28);
      const finalGender = gender || derivedDemographics.gender || 'male';
      const finalDob = validatedData.dob || derivedDemographics.dob || null;
      const finalPhone = phone || newUserPayload.phone || derivedDemographics.phone || null;

      if (!newUserPayload.phone && finalPhone) {
        newUserPayload.phone = finalPhone;
      }

      newUserPayload.patientDetails = {
        age: finalAge,
        dob: finalDob,
        gender: finalGender,
        bloodGroup: bloodGroup || 'O+',
        address: address || `${derivedDemographics.district || 'Jaipur'}, ${derivedDemographics.state || 'Rajasthan'}, India`,
        abhaId: `91-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}`,
        schemes: schemes || {
          isEnrolled: false,
          hasGovScheme: false,
          hasPrivateScheme: false
        }
      };
    } else if (role === 'doctor') {
      newUserPayload.doctorDetails = {
        nmcId: nmcId || null,
        specialty: specialty || 'General Medicine',
        department: department || 'OPD',
        hospitalName: hospitalName || 'SMS Hospital Jaipur'
      };
    } else if (role === 'hospital') {
      newUserPayload.hospitalDetails = {
        hospitalRegNo: hospitalRegNo || null,
        facilityType: validatedData.facilityType || 'General Hospital',
        address: address || null,
        licenseNumber: validatedData.licenseNumber || null
      };
    } else if (role === 'kiosk') {
      newUserPayload.kioskDetails = {
        terminalId: terminalId || customId,
        hospitalId: hospitalId || null,
        location: location || 'Hospital Reception'
      };
    }

    const createdUser = await userRepository.createUser(newUserPayload);

    // Issue JWT Token Pair
    const tokenPair = generateTokenPair(createdUser);

    return {
      ...tokenPair,
      user: createdUser,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully in MongoDB`
    };
  }

  /**
   * Renew Access Token using valid Refresh Token
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    if (tokenRepository.isBlacklisted(refreshToken)) {
      throw new Error('Refresh token has been revoked. Please log in again.');
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid or expired refresh token. Please sign in again.');
    }

    const user = await userRepository.findById(decoded.sub || decoded.id);
    if (!user) {
      throw new Error('User for this refresh token no longer exists');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
      throw new Error(`Account has been ${user.status.toLowerCase()}`);
    }

    const tokenPair = generateTokenPair(user);

    return {
      ...tokenPair,
      user
    };
  }

  /**
   * Verify and inspect a JWT token
   */
  verifyTokenStatus(token) {
    if (!token) {
      return { valid: false, message: 'Token not provided' };
    }

    if (tokenRepository.isBlacklisted(token)) {
      return { valid: false, message: 'Token has been revoked/blacklisted' };
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return { valid: false, message: 'Token is invalid or expired' };
    }

    return {
      valid: true,
      claims: decoded
    };
  }

  /**
   * Logout user by revoking and blacklisting their JWT token(s) in MongoDB
   */
  async logout(token, refreshToken = null) {
    if (token) {
      const decoded = decodeToken(token);
      await tokenRepository.blacklistToken(token, decoded || {}, 'logout');
    }

    if (refreshToken) {
      const decodedRefresh = decodeToken(refreshToken);
      await tokenRepository.blacklistToken(refreshToken, decodedRefresh || {}, 'logout');
    }

    return { message: 'Logged out successfully. JWT tokens revoked.' };
  }

  /**
   * Complete registration following OTP verification
   */
  async completeOtpRegistration({ verificationToken, name, password, pin, email, schemes, age, gender }) {
    if (!verificationToken) {
      throw new Error('Verification token is missing. Please complete OTP verification first.');
    }

    const otpSession = await userRepository.findOtpSessionByToken(verificationToken);

    if (!otpSession) {
      throw new Error('Invalid or expired verification session. Please verify OTP again.');
    }

    if (!otpSession.isVerified) {
      throw new Error('OTP was not verified for this session.');
    }

    return this.register({
      role: 'patient',
      name: name || 'Aadhaar Verified Patient',
      email: email || null,
      phone: otpSession.phone !== 'NA' ? otpSession.phone : null,
      password: password || pin || '1234',
      pin: pin || password || '1234',
      aadhaarReference: otpSession.aadhaarReference,
      maskedAadhaar: otpSession.maskedAadhaar,
      schemes,
      age,
      gender
    });
  }

  /**
   * Change password for logged in user
   */
  async changePassword(userId, currentPassword, newPassword) {
    const rawUser = await userRepository.findById(userId);
    if (!rawUser) {
      throw new Error('User not found');
    }

    const fullUser = await userRepository.findRawByRoleAndIdentifier(rawUser.role, rawUser.email || rawUser.phone || rawUser.customId);
    if (!fullUser) {
      throw new Error('User authentication record not found');
    }

    let isMatch = await bcrypt.compare(currentPassword, fullUser.passwordHash);
    if (!isMatch && fullUser.pinHash) {
      isMatch = await bcrypt.compare(currentPassword, fullUser.pinHash);
    }
    if (!isMatch) {
      throw new Error('Current password or PIN is incorrect');
    }

    if (!newPassword || newPassword.length < 4) {
      throw new Error('New password must be at least 4 characters');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updateUser(userId, { passwordHash });

    return { message: 'Password updated successfully' };
  }

  /**
   * Get user profile by user ID
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User profile not found');
    }
    return user;
  }
}

module.exports = new AuthService();
