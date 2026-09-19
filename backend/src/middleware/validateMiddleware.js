const { errorResponse } = require('../utils/responseFormatter');
const { isValidAadhaar } = require('../utils/aadhaarUtils');

function validateLogin(req, res, next) {
  const { role, identifier, password, pin, email, phone, terminalId } = req.body;

  const resolvedRole = (role || 'patient').toLowerCase();
  const validRoles = ['patient', 'doctor', 'hospital', 'kiosk', 'admin'];

  if (!validRoles.includes(resolvedRole)) {
    return errorResponse(res, `Invalid role '${role}'. Must be one of: ${validRoles.join(', ')}`, 400);
  }

  const resolvedIdentifier = identifier || email || phone || terminalId;
  const resolvedSecret = password || pin;

  if (!resolvedIdentifier) {
    return errorResponse(res, 'Login identifier (email, phone, Aadhaar, NMC ID, or terminal ID) is required', 400);
  }

  if (!resolvedSecret) {
    return errorResponse(res, 'Password or PIN is required', 400);
  }

  req.authPayload = {
    role: resolvedRole,
    identifier: String(resolvedIdentifier).trim(),
    secret: String(resolvedSecret).trim()
  };

  next();
}

function validateRegister(req, res, next) {
  const { role, name, fullName, email, phone, password, pin, aadhaar, nmcId, hospitalRegNo } = req.body;

  const resolvedRole = (role || 'patient').toLowerCase();
  const validRoles = ['patient', 'doctor', 'hospital', 'kiosk', 'admin'];

  if (!validRoles.includes(resolvedRole)) {
    return errorResponse(res, `Invalid role '${role}'. Must be one of: ${validRoles.join(', ')}`, 400);
  }

  const resolvedName = name || fullName;
  if (!resolvedName || String(resolvedName).trim().length < 2) {
    return errorResponse(res, 'Full name or facility name (minimum 2 characters) is required', 400);
  }

  const secret = password || pin;
  if (!secret || String(secret).trim().length < 4) {
    return errorResponse(res, 'Password or PIN must be at least 4 characters/digits', 400);
  }

  // Role-specific validation
  if (resolvedRole === 'patient') {
    if (aadhaar && !isValidAadhaar(aadhaar)) {
      return errorResponse(res, 'Invalid Aadhaar format. Must be a 12-digit numeric identifier.', 400);
    }
  } else if (resolvedRole === 'doctor') {
    if (!email && !phone) {
      return errorResponse(res, 'Doctor registration requires professional email or phone number', 400);
    }
  } else if (resolvedRole === 'hospital') {
    if (!email && !phone) {
      return errorResponse(res, 'Hospital registration requires official nodal email or phone number', 400);
    }
  }

  req.validatedRegister = {
    role: resolvedRole,
    name: String(resolvedName).trim(),
    email: email ? String(email).trim().toLowerCase() : null,
    phone: phone ? String(phone).trim() : null,
    password: String(secret).trim(),
    aadhaar: aadhaar ? String(aadhaar).trim() : null,
    nmcId: nmcId ? String(nmcId).trim() : null,
    hospitalRegNo: hospitalRegNo ? String(hospitalRegNo).trim() : null,
    ...req.body
  };

  next();
}

function validateOtpRequest(req, res, next) {
  const { aadhaar, phone } = req.body;

  if (!aadhaar && !phone) {
    return errorResponse(res, 'Aadhaar number or mobile number is required to request OTP', 400);
  }

  if (aadhaar && !isValidAadhaar(aadhaar)) {
    return errorResponse(res, 'Invalid Aadhaar number. Must contain exactly 12 numeric digits.', 400);
  }

  if (phone) {
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return errorResponse(res, 'Invalid mobile number. Must contain at least 10 digits.', 400);
    }
  }

  next();
}

function validateOtpVerify(req, res, next) {
  const { sessionId, otpSessionId, otp } = req.body;
  const activeSessionId = sessionId || otpSessionId;

  if (!activeSessionId) {
    return errorResponse(res, 'OTP session identifier (sessionId) is required', 400);
  }

  if (!otp || String(otp).trim().length !== 6) {
    return errorResponse(res, 'A valid 6-digit OTP code is required', 400);
  }

  req.otpVerifyPayload = {
    sessionId: activeSessionId,
    otp: String(otp).trim()
  };

  next();
}

module.exports = {
  validateLogin,
  validateRegister,
  validateOtpRequest,
  validateOtpVerify
};
