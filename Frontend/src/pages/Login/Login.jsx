import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import '../../styles/login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, completeOtpRegistration } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'hospital' | 'kiosk'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Scheme toggles for Patient signup
  const [schemeEnrolled, setSchemeEnrolled] = useState(false);
  const [hasGovScheme, setHasGovScheme] = useState(false);
  const [govSchemeType, setGovSchemeType] = useState('RGHS');
  const [govSchemeNum, setGovSchemeNum] = useState('');
  const [hasPrivateScheme, setHasPrivateScheme] = useState(false);
  const [privateProvider, setPrivateProvider] = useState('');
  const [privatePolicyNum, setPrivatePolicyNum] = useState('');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [patientPin, setPatientPin] = useState('');
  const [hospitalPin, setHospitalPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [hospitalRegNo, setHospitalRegNo] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [facilityType, setFacilityType] = useState('Super Specialty Government Hospital');
  const [aadhaarNum, setAadhaarNum] = useState('');

  // Aadhaar Auto-fetch and e-KYC states
  const [aadhaarProfile, setAadhaarProfile] = useState(null);
  const [fetchingAadhaar, setFetchingAadhaar] = useState(false);

  // Aadhaar OTP Verification states
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [maskedAadhaar, setMaskedAadhaar] = useState('');

  // Listen to navigation state or URL query for requested role (e.g. /login?role=doctor)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryRole = params.get('role');
    if (queryRole && ['patient', 'doctor', 'hospital', 'kiosk'].includes(queryRole)) {
      setRole(queryRole);
    } else if (location.state?.from?.pathname?.includes('/doctor')) {
      setRole('doctor');
    } else if (location.state?.from?.pathname?.includes('/hospital')) {
      setRole('hospital');
    } else if (location.state?.from?.pathname?.includes('/kiosk')) {
      setRole('kiosk');
    }
  }, [location]);

  // Handle entering Aadhaar number: automatically fetch demographic profile from Aadhaar DB
  const handleAadhaarChange = async (val) => {
    const cleanDigits = val.replace(/\D/g, '').slice(0, 12);
    setAadhaarNum(cleanDigits);

    if (cleanDigits.length === 12) {
      setFetchingAadhaar(true);
      try {
        const profile = await authService.fetchAadhaar(cleanDigits);
        setAadhaarProfile(profile);
        setMaskedAadhaar(profile.maskedAadhaar || `XXXX XXXX ${cleanDigits.slice(-4)}`);
        if (profile.phone && !phone) setPhone(profile.phone);
        if (profile.age) setAge(profile.age);
        if (profile.genderLabel) setGender(profile.genderLabel);
      } catch (e) {
        console.warn('Aadhaar demographic lookup:', e.message);
      } finally {
        setFetchingAadhaar(false);
      }
    } else {
      setAadhaarProfile(null);
    }
  };

  const handleRequestOtp = async () => {
    const cleanAadhaar = String(aadhaarNum).replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar number before requesting OTP.');
      return;
    }

    setErrorMsg('');
    setOtpLoading(true);
    try {
      const res = await authService.requestOtp(cleanAadhaar, phone);
      const data = res.data || res;
      if (!res.success && res.message) {
        throw new Error(res.message);
      }
      setOtpSessionId(data.sessionId);
      setMaskedAadhaar(data.maskedAadhaar || `XXXX XXXX ${cleanAadhaar.slice(-4)}`);
      if (data.aadhaarProfile) {
        setAadhaarProfile(data.aadhaarProfile);
        if (data.aadhaarProfile.phone && !phone) setPhone(data.aadhaarProfile.phone);
        if (data.aadhaarProfile.age) setAge(data.aadhaarProfile.age);
        if (data.aadhaarProfile.genderLabel) setGender(data.aadhaarProfile.genderLabel);
      }
      setOtpRequested(true);
      const devCodeNotice = data.devOtp ? ` (Verification Code: ${data.devOtp})` : '';
      setOtpSentNotice(`OTP sent to mobile linked with Aadhaar${devCodeNotice}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to request OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanCode = String(otpCode).trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code received on your mobile.');
      return;
    }

    setErrorMsg('');
    setOtpLoading(true);
    try {
      const res = await authService.verifyOtp(otpSessionId, cleanCode);
      const data = res.data || res;
      if (!res.success && res.message) {
        throw new Error(res.message);
      }
      setOtpVerified(true);
      setVerificationToken(data.verificationToken);
      if (data.aadhaarProfile) {
        setAadhaarProfile(data.aadhaarProfile);
      }
      setSuccessMsg('Aadhaar identity verified! Demographic data linked from Aadhaar registry.');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP. Please check the code and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // If patient entered 12-digit Aadhaar with spaces, strip to clean digits
      let cleanIdentifier = identifier.trim();
      if (role === 'patient' && cleanIdentifier.replace(/\D/g, '').length === 12) {
        cleanIdentifier = cleanIdentifier.replace(/\D/g, '');
      }

      const credentials = {
        identifier: cleanIdentifier,
        password: password.trim(),
        pin: password.trim()
      };

      await login(role, credentials);
      setSuccessMsg(
        role === 'kiosk'
          ? 'Kiosk Terminal Authorized for Hospital'
          : `${role.charAt(0).toUpperCase() + role.slice(1)} Login Successful`
      );

      setTimeout(() => {
        if (role === 'kiosk') {
          navigate('/kiosk');
        } else {
          navigate(`/${role}/dashboard`);
        }
      }, 700);
    } catch (err) {
      console.error('[Login] Error:', err.message);
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (role === 'patient') {
        const pin = patientPin || password;
        if (!pin || pin.length < 4) {
          throw new Error('Please set a 4-digit security PIN for your patient account.');
        }

        const cleanAadhaar = String(aadhaarNum).replace(/\D/g, '');
        if (cleanAadhaar.length !== 12) {
          throw new Error('Please enter your valid 12-digit Aadhaar number.');
        }

        if (!fullName || fullName.trim().length < 2) {
          throw new Error('Please enter your full name as per Aadhaar.');
        }

        if (!email || !email.trim()) {
          throw new Error('Please enter your email address for account access.');
        }

        // Auto-extract demographics if not yet fetched
        let derived = aadhaarProfile;
        if (!derived) {
          try {
            derived = await authService.fetchAadhaar(cleanAadhaar);
          } catch (e) {
            console.warn('Fallback demographic derivation:', e.message);
          }
        }

        const schemesData = schemeEnrolled ? {
          isEnrolled: true,
          hasGovScheme,
          govSchemeType: hasGovScheme ? govSchemeType : null,
          govSchemeNum: hasGovScheme ? govSchemeNum : null,
          hasPrivateScheme,
          privateProvider: hasPrivateScheme ? privateProvider : null,
          privatePolicyNum: hasPrivateScheme ? privatePolicyNum : null
        } : { isEnrolled: false };

        if (otpVerified && verificationToken) {
          await completeOtpRegistration({
            verificationToken,
            fullName: fullName.trim(),
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || derived?.phone,
            pin,
            password: password.trim() || pin,
            schemes: schemesData,
            age: age ? Number(age) : (derived?.age || 28),
            dob: derived?.dob,
            gender: gender || derived?.genderLabel || 'Male'
          });
        } else {
          await register('patient', {
            fullName: fullName.trim(),
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || derived?.phone,
            aadhaar: cleanAadhaar,
            pin,
            password: password.trim() || pin,
            schemes: schemesData,
            age: age ? Number(age) : (derived?.age || 28),
            dob: derived?.dob,
            gender: gender || derived?.genderLabel || 'Male'
          });
        }

        setSuccessMsg('Patient account registered successfully! Logging you in...');
        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 700);
      } else if (role === 'hospital') {
        const pin = hospitalPin || password;
        if (!hospitalRegNo) {
          throw new Error('Hospital State Health Registration Number is required.');
        }

        await register('hospital', {
          fullName: fullName.trim(),
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          hospitalRegNo: hospitalRegNo.trim(),
          licenseNumber: licenseNumber.trim() || undefined,
          facilityType,
          password: password.trim() || pin,
          pin
        });

        setSuccessMsg('Hospital facility registered and credentialed successfully!');
        setTimeout(() => {
          navigate('/hospital/dashboard');
        }, 700);
      }
    } catch (err) {
      console.error('[Signup] Error:', err.message);
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
      setLoading(false);
    }
  };

  return (
    <div className="login-portal">
      {/* Ambient Refraction Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

      <div className="glass-card w-full max-w-[620px] rounded-[2rem] flex flex-col relative z-10 overflow-hidden max-h-[96vh] flex-shrink-0 shadow-2xl">
        {/* Header Section */}
        <div className="pt-7 px-8 sm:px-10 pb-3 text-center shrink-0">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary text-primary text-2xl mb-3 shadow-sm border border-secondaryDark">
            <i className="fa-solid fa-heart-pulse text-primary"></i>
          </div>
          <h1 className="text-3xl font-bold text-maintext tracking-tight mb-1">MediCare</h1>
          <p className="text-sectext text-sm font-medium">Unified Healthcare & Clinical Practice Portal</p>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto custom-scrollbar px-8 sm:px-10 pb-8">
          {/* Mode Switcher: Login / Signup (Disabled for Kiosk) */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-5 mt-1 relative border border-gray-200">
            <button
              type="button"
              onClick={() => { setMode('login'); setSuccessMsg(''); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 tab-btn ${
                mode === 'login'
                  ? 'text-primary bg-white shadow-sm border border-blue-200/60'
                  : 'text-sectext hover:text-primary bg-transparent'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                if (role === 'kiosk') setRole('patient');
                setMode('signup');
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 tab-btn ${
                mode === 'signup'
                  ? 'text-primary bg-white shadow-sm border border-blue-200/60'
                  : 'text-sectext hover:text-primary bg-transparent'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Mode Heading */}
          <div className="text-center mb-5">
            <h2 className="text-2xl font-semibold text-maintext">
              {mode === 'login'
                ? role === 'kiosk'
                  ? 'OPD Kiosk Terminal'
                  : 'Welcome Back'
                : 'Create an Account'}
            </h2>
            <p className="text-sectext text-sm mt-1">
              {mode === 'login'
                ? role === 'kiosk'
                  ? 'Launch self-service registration and token issuance terminal'
                  : 'Please enter your credentials to continue'
                : 'Join the national digital healthcare network'}
            </p>
          </div>

          {/* Role Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => { setRole('patient'); setErrorMsg(''); }}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                role === 'patient'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-sectext hover:text-primary'
              }`}
            >
              <i className="fa-solid fa-user mr-1 sm:mr-2"></i>Patient
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setRole('doctor'); setErrorMsg(''); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  role === 'doctor'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-sectext hover:text-primary'
                }`}
              >
                <i className="fa-solid fa-user-doctor mr-1 sm:mr-2"></i>Doctor
              </button>
            )}

            <button
              type="button"
              onClick={() => { setRole('hospital'); setErrorMsg(''); }}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                role === 'hospital'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-sectext hover:text-primary'
              }`}
            >
              <i className="fa-regular fa-building mr-1 sm:mr-2"></i>Hospital
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setRole('kiosk');
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  role === 'kiosk'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-sectext hover:text-primary'
                }`}
              >
                <i className="fa-solid fa-desktop mr-1 sm:mr-2"></i>Kiosk
              </button>
            )}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-red-500 text-base shrink-0"></i>
              <span className="flex-1">{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-700 text-sm font-bold">✕</button>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================
              LOGIN FORMS
             ======================================================== */}
          {mode === 'login' && (
            <div>
              {/* 1. Patient Login */}
              {role === 'patient' && (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-blue-600 shrink-0"></i>
                    <span>Web Login: Sign in using your registered <strong>Email</strong> or <strong>12-Digit Aadhaar</strong> with your 4-digit PIN.</span>
                  </div>

                  <div className="input-icon-wrapper">
                    <i className="fa-regular fa-id-card leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Email Address or 12-Digit Aadhaar Number"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>
                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-key leading-icon"></i>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="4-Digit PIN or Password"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80 font-mono"
                    />
                  </div>

                  {/* Simulated Security Verification */}
                  <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked required className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary" />
                      <span className="text-sm font-medium text-maintext">Verify Patient Identity</span>
                    </label>
                    <i className="fa-solid fa-shield-halved text-primary text-xl opacity-80"></i>
                  </div>

                  <div className="flex items-center justify-between pt-1 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary border-gray-300" />
                      <span className="text-sm font-medium text-maintext">Remember me</span>
                    </label>
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-primary hover:underline">Forgot PIN or Password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-4 rounded-xl transition-all shadow-md shadow-primary/25 flex justify-center items-center gap-2 text-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Signing In...
                      </>
                    ) : (
                      <>
                        Patient Sign In <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 2. Doctor Login */}
              {role === 'doctor' && (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-left text-xs text-blue-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <i className="fa-solid fa-user-doctor text-blue-600"></i> Doctor Clinical Portal Sign In
                      </span>
                      <span className="bg-blue-200 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                        NMC Registry
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Doctor accounts are credentialed directly by your affiliated hospital administrator. Sign in using your assigned NMC ID or professional email.
                    </p>
                    <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] text-blue-900 font-mono">
                        Demo: <strong>NMC-2024-CARD-9912</strong> (PIN: <strong>1234</strong>)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIdentifier('NMC-2024-CARD-9912');
                          setPassword('1234');
                        }}
                        className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1 rounded-lg transition-all shadow-sm flex items-center gap-1"
                      >
                        <i className="fa-solid fa-bolt text-yellow-300 text-[10px]"></i> Fill Doctor Credentials
                      </button>
                    </div>
                  </div>

                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-stethoscope leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="NMC Registration ID or Professional Email"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80 font-mono"
                    />
                  </div>
                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-lock leading-icon"></i>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password or 4-Digit PIN (e.g. 1234)"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked required className="w-5 h-5 rounded text-primary border-gray-300" />
                      <span className="text-sm font-medium text-maintext">Verify NMC Medical Registry</span>
                    </label>
                    <i className="fa-solid fa-shield-halved text-primary text-xl opacity-80"></i>
                  </div>

                  <div className="flex items-center justify-between pt-1 pb-2">
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-primary hover:underline ml-auto">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-4 rounded-xl transition-all shadow-md shadow-primary/25 flex justify-center items-center gap-2 text-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Authorizing Doctor...
                      </>
                    ) : (
                      <>
                        Doctor Sign In <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 3. Hospital Login */}
              {role === 'hospital' && (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="input-icon-wrapper">
                    <i className="fa-regular fa-building leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="State Health Reg. No., License No., or Email"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>
                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-lock leading-icon"></i>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Hospital PIN or Admin Password"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked required className="w-5 h-5 rounded text-primary border-gray-300" />
                      <span className="text-sm font-medium text-maintext">Verify Facility Accreditation</span>
                    </label>
                    <i className="fa-solid fa-shield-halved text-primary text-xl opacity-80"></i>
                  </div>

                  <div className="flex items-center justify-between pt-1 pb-2">
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-primary hover:underline ml-auto">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-4 rounded-xl transition-all shadow-md shadow-primary/25 flex justify-center items-center gap-2 text-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Authenticating Facility...
                      </>
                    ) : (
                      <>
                        Facility Sign In <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 4. Dedicated Kiosk Login */}
              {role === 'kiosk' && (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-left">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                      <i className="fa-solid fa-desktop"></i> OPD Self-Check-in Terminal Setup
                    </div>
                    <p className="text-xs text-blue-700">
                      Authorizes this screen as a dedicated OPD touch terminal for your hospital. Enter your hospital registration number or nodal admin email and PIN/password to initialize.
                    </p>
                  </div>

                  <div className="input-icon-wrapper">
                    <i className="fa-regular fa-building leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Hospital Reg No. or Admin Email (e.g. RJ-MED-2014-991)"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-key leading-icon"></i>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Hospital PIN or Admin Password"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-sectext flex items-center justify-between">
                    <span>Terminal Mode: <strong>Hospital Dedicated OPD Kiosk</strong></span>
                    <span className="text-success font-semibold">● Ready</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-4 rounded-xl transition-all shadow-md shadow-primary/25 flex justify-center items-center gap-2 text-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Initializing Terminal...
                      </>
                    ) : (
                      <>
                        Authorize & Launch Kiosk <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              SIGN UP FORMS
             ======================================================== */}
          {mode === 'signup' && (
            <div>
              {/* 1. Patient Sign Up */}
              {role === 'patient' && (
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  {/* e-KYC Info Banner */}
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-left text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <i className="fa-solid fa-bolt text-teal-600"></i>
                      <span>Instant Aadhaar e-KYC Registration</span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                      Just enter your <strong>Name</strong>, <strong>Aadhaar</strong>, <strong>PIN</strong>, and <strong>Email</strong>. Your DOB, Age, Gender, and Linked Mobile are auto-fetched from the Aadhaar database!
                    </p>
                  </div>

                  {/* 1. Full Name */}
                  <div className="input-icon-wrapper">
                    <i className="fa-regular fa-user leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name (as per Aadhaar)"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  {/* 2. 12-Digit Aadhaar Number */}
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="input-icon-wrapper">
                        <i className="fa-regular fa-id-card leading-icon"></i>
                        <input
                          type="text"
                          maxLength="12"
                          required
                          value={aadhaarNum}
                          onChange={(e) => handleAadhaarChange(e.target.value)}
                          placeholder="12-Digit Aadhaar Number (e.g. 123456789012)"
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80 font-mono tracking-wider"
                        />
                      </div>
                      {fetchingAadhaar && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-primary flex items-center gap-1.5 font-medium bg-white/90 px-2 py-1 rounded">
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          <span>Fetching Aadhaar e-KYC...</span>
                        </div>
                      )}
                    </div>

                    {/* Auto-Fetched Aadhaar Demographic Profile Card */}
                    {aadhaarProfile && (
                      <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl text-left text-xs space-y-2 shadow-sm animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                            Aadhaar DB Record Verified
                          </span>
                          <span className="font-mono text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                            {aadhaarProfile.maskedAadhaar || `XXXX XXXX ${aadhaarNum.slice(-4)}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200/80">
                          <div><span className="text-gray-500">DOB / Age:</span> <strong className="text-emerald-950 ml-1">{aadhaarProfile.dob} ({aadhaarProfile.age} yrs)</strong></div>
                          <div><span className="text-gray-500">Gender:</span> <strong className="text-emerald-950 ml-1">{aadhaarProfile.genderLabel || aadhaarProfile.gender}</strong></div>
                          <div><span className="text-gray-500">Linked Phone:</span> <strong className="text-emerald-950 ml-1 font-mono">{aadhaarProfile.phone}</strong></div>
                          <div><span className="text-gray-500">Location:</span> <strong className="text-emerald-950 ml-1">{aadhaarProfile.district}, {aadhaarProfile.state}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Create 4-Digit Security PIN */}
                  <div className="space-y-1 text-left">
                    <div className="input-icon-wrapper">
                      <i className="fa-solid fa-key leading-icon"></i>
                      <input
                        type="password"
                        maxLength="4"
                        required
                        value={patientPin}
                        onChange={(e) => setPatientPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Create 4-Digit Security PIN (e.g. 1234)"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80 font-mono tracking-widest text-base"
                      />
                    </div>
                    <p className="text-[11px] text-sectext px-1">
                      Use this 4-digit PIN to sign in on web or at any hospital kiosk terminal.
                    </p>
                  </div>

                  {/* 4. Email Address */}
                  <div className="space-y-1 text-left">
                    <div className="input-icon-wrapper">
                      <i className="fa-regular fa-envelope leading-icon"></i>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address (e.g. user@example.com)"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                      />
                    </div>
                    <p className="text-[11px] text-sectext px-1">
                      You can log in using either your <strong>Email</strong> or <strong>Aadhaar Number</strong>.
                    </p>
                  </div>

                  {/* Health Coverage Scheme Section with Rajasthan Government Options */}
                  <div className="space-y-3 p-3.5 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm text-left">
                    <div>
                      <label className="block text-xs font-bold text-maintext uppercase tracking-wide flex items-center gap-1.5">
                        <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                        Are you enrolled in any health scheme?
                      </label>
                      <p className="text-[11px] text-sectext mt-0.5">
                        Link your government or private insurance to unlock cashless OPD and treatment.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white cursor-pointer select-none">
                        <input
                          type="radio"
                          name="signup_scheme_enrolled"
                          checked={!schemeEnrolled}
                          onChange={() => setSchemeEnrolled(false)}
                          className="w-4 h-4 text-slate-800 border-gray-300"
                        />
                        <div>
                          <span className="text-xs font-bold text-maintext block">No, not enrolled</span>
                          <span className="text-[10px] text-sectext block">Fast registration</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white cursor-pointer select-none">
                        <input
                          type="radio"
                          name="signup_scheme_enrolled"
                          checked={schemeEnrolled}
                          onChange={() => setSchemeEnrolled(true)}
                          className="w-4 h-4 text-slate-800 border-gray-300"
                        />
                        <div>
                          <span className="text-xs font-bold text-maintext block">Yes, I am enrolled</span>
                          <span className="text-[10px] text-slate-700 font-semibold block">Gov / Private Scheme</span>
                        </div>
                      </label>
                    </div>

                    {schemeEnrolled && (
                      <div className="space-y-2.5 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-slate-800">Select applicable schemes (both supported):</p>

                        {/* Rajasthan Government Scheme */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={hasGovScheme}
                              onChange={(e) => setHasGovScheme(e.target.checked)}
                              className="w-4 h-4 mt-0.5 rounded text-slate-800 border-gray-300"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-maintext block flex items-center gap-1.5">
                                <i className="fa-solid fa-building-columns text-slate-700"></i>Health scheme in Rajasthan government
                              </span>
                              <span className="text-[11px] text-sectext block">RGHS, Mukhyamantri Ayushman Arogya (MAA-Y), Jan Aadhaar</span>
                            </div>
                          </label>

                          {hasGovScheme && (
                            <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                              <select
                                value={govSchemeType}
                                onChange={(e) => setGovSchemeType(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 outline-none focus:border-primary"
                              >
                                <option value="RGHS">RGHS (Rajasthan Government Health Scheme)</option>
                                <option value="MAA-Y">Mukhyamantri Ayushman Arogya (MAA-Y)</option>
                                <option value="Jan-Aadhaar">Jan Aadhaar Health Card</option>
                                <option value="Other-RJ">Other Rajasthan State Scheme</option>
                              </select>
                              <input
                                type="text"
                                value={govSchemeNum}
                                onChange={(e) => setGovSchemeNum(e.target.value)}
                                placeholder="Rajasthan Scheme Card / Beneficiary Number (e.g. RGHS-RJ-4491)"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-primary bg-white"
                              />
                            </div>
                          )}
                        </div>

                        {/* Private Health Insurance Scheme */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={hasPrivateScheme}
                              onChange={(e) => setHasPrivateScheme(e.target.checked)}
                              className="w-4 h-4 mt-0.5 rounded text-success border-gray-300"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-maintext block flex items-center gap-1.5">
                                <i className="fa-solid fa-shield-heart text-success"></i>Health scheme in private section
                              </span>
                              <span className="text-[11px] text-sectext block">Private Health Insurance, Corporate Mediclaim, TPA Cover</span>
                            </div>
                          </label>

                          {hasPrivateScheme && (
                            <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={privateProvider}
                                onChange={(e) => setPrivateProvider(e.target.value)}
                                placeholder="Insurance Provider (e.g. Star Health)"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-primary bg-white"
                              />
                              <input
                                type="text"
                                value={privatePolicyNum}
                                onChange={(e) => setPrivatePolicyNum(e.target.value)}
                                placeholder="Policy / Card Number"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-primary bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-900/20 flex justify-center items-center gap-2 text-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Creating Account...
                      </>
                    ) : (
                      <>
                        Create Patient Account <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 2. Hospital Sign Up */}
              {role === 'hospital' && (
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  {/* Hospital Name */}
                  <div className="input-icon-wrapper">
                    <i className="fa-regular fa-building leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Hospital Legal Name (e.g. SMS Hospital Jaipur)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  {/* Nodal Email and Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="input-icon-wrapper">
                      <i className="fa-regular fa-envelope leading-icon"></i>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Official Nodal Email"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                      />
                    </div>
                    <div className="input-icon-wrapper">
                      <i className="fa-solid fa-phone leading-icon"></i>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nodal Contact Number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                      />
                    </div>
                  </div>

                  {/* Facility Registration & License Details */}
                  <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3">
                    <label className="block text-xs font-bold text-maintext uppercase tracking-wide">
                      <i className="fa-solid fa-file-contract mr-2 text-emerald-700"></i>Facility Accreditation & Credentials
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        value={hospitalRegNo}
                        onChange={(e) => setHospitalRegNo(e.target.value)}
                        placeholder="State Reg. No. (e.g. RJ-MED-2014-991)"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-maintext focus:border-primary outline-none bg-white font-mono"
                      />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="License No. (e.g. LIC-RAJ-2024-8842)"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-maintext focus:border-primary outline-none bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-maintext mb-1">Facility Category / Type</label>
                      <select
                        value={facilityType}
                        onChange={(e) => setFacilityType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-maintext focus:border-primary outline-none bg-white"
                      >
                        <option value="Multi-Specialty Hospital">Multi-Specialty Hospital</option>
                        <option value="District Hospital">District Hospital</option>
                        <option value="Primary Health Centre (PHC)">Primary Health Centre (PHC)</option>
                        <option value="Community Health Centre (CHC)">Community Health Centre (CHC)</option>
                        <option value="Private Clinic / Nursing Home">Private Clinic / Nursing Home</option>
                        <option value="Super-Specialty Institute">Super-Specialty Institute</option>
                      </select>
                    </div>
                  </div>

                  {/* Hospital PIN and Admin Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="input-icon-wrapper">
                      <i className="fa-solid fa-key leading-icon"></i>
                      <input
                        type="password"
                        maxLength="4"
                        required
                        value={hospitalPin}
                        onChange={(e) => setHospitalPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Set 4-Digit Hospital PIN"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80 font-mono"
                      />
                    </div>
                    <div className="input-icon-wrapper">
                      <i className="fa-solid fa-lock leading-icon"></i>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Admin Password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-primary/25 flex justify-center items-center gap-2 text-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Registering Facility...
                      </>
                    ) : (
                      <>
                        Register Hospital Facility <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
