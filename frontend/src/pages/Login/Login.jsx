import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'hospital' | 'kiosk'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nmcId, setNmcId] = useState('');
  const [hospitalRegNo, setHospitalRegNo] = useState('');
  const [aadhaarNum, setAadhaarNum] = useState('');
  const [kioskTerminalId, setKioskTerminalId] = useState('KIOSK-TER-04');
  const [kioskPin, setKioskPin] = useState('1234');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let credentials = { identifier, password };
      if (role === 'kiosk') {
        credentials = { identifier: kioskTerminalId, pin: kioskPin };
      }

      await login(role, credentials);
      setSuccessMsg(
        role === 'kiosk'
          ? 'Kiosk Terminal Initialized'
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
      console.error(err);
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signupData = {
        fullName,
        email,
        phone,
        password,
        role
      };

      if (role === 'patient') {
        signupData.aadhaar = aadhaarNum;
        if (schemeEnrolled) {
          signupData.schemes = {
            isEnrolled: true,
            hasGovScheme,
            govSchemeType: hasGovScheme ? govSchemeType : null,
            govSchemeNum: hasGovScheme ? govSchemeNum : null,
            hasPrivateScheme,
            privateProvider: hasPrivateScheme ? privateProvider : null,
            privatePolicyNum: hasPrivateScheme ? privatePolicyNum : null
          };
        }
      } else if (role === 'doctor') {
        signupData.nmcId = nmcId;
      } else if (role === 'hospital') {
        signupData.hospitalRegNo = hospitalRegNo;
      }

      await register(role, signupData);
      setSuccessMsg(`${role.charAt(0).toUpperCase() + role.slice(1)} Registered Successfully`);

      setTimeout(() => {
        navigate(`/${role}/dashboard`);
      }, 800);
    } catch (err) {
      console.error(err);
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
              onClick={() => { setMode('login'); setSuccessMsg(''); }}
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

          {/* Role Navigation Tabs (4 Roles: Patient, Doctor, Hospital, Kiosk) */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                role === 'patient'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-sectext hover:text-primary'
              }`}
            >
              <i className="fa-solid fa-user mr-1 sm:mr-2"></i>Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                role === 'doctor'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-sectext hover:text-primary'
              }`}
            >
              <i className="fa-solid fa-user-doctor mr-1 sm:mr-2"></i>Doctor
            </button>
            <button
              type="button"
              onClick={() => setRole('hospital')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                role === 'hospital'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-sectext hover:text-primary'
              }`}
            >
              <i className="fa-regular fa-building mr-1 sm:mr-2"></i>Hospital
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('kiosk');
                setMode('login');
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                role === 'kiosk'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-sectext hover:text-primary'
              }`}
            >
              <i className="fa-solid fa-hospital mr-1 sm:mr-2"></i>Kiosk
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2 animate-fadeIn">
              <i className="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
              <span>{successMsg} — Redirecting...</span>
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
                  <div className="input-icon-wrapper">
                    <i className="fa-regular fa-envelope leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Email or Phone Number (e.g. rahul.sharma@example.com)"
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
                      placeholder="Password"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
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
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
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
                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-stethoscope leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="NMC Registration ID or Professional Email"
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
                      placeholder="Password"
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
                      placeholder="Facility ID or Nodal Administrative Email"
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
                      placeholder="Administrative Password"
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
                      Authorizes this screen as a dedicated OPD touch terminal for patients to register, pick departments, and receive appointment tokens.
                    </p>
                  </div>

                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-terminal leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={kioskTerminalId}
                      onChange={(e) => setKioskTerminalId(e.target.value)}
                      placeholder="Terminal Identifier (e.g. KIOSK-TER-04)"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-key leading-icon"></i>
                    <input
                      type="password"
                      required
                      value={kioskPin}
                      onChange={(e) => setKioskPin(e.target.value)}
                      placeholder="Master Terminal PIN (Default: 1234)"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-sectext flex items-center justify-between">
                    <span>Active Station: <strong>Main Ground Reception</strong></span>
                    <span className="text-success font-semibold">● Online</span>
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
                        Launch Kiosk Terminal <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/kiosk')}
                    className="w-full mt-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 rounded-xl border border-blue-200 transition-all flex justify-center items-center gap-2 text-sm"
                  >
                    <i className="fa-solid fa-bolt"></i> Open Kiosk Directly (Instant Mode)
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
                  <div className="input-icon-wrapper">
                    <i className="fa-regular fa-user leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name (as per Aadhaar / National ID)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="input-icon-wrapper">
                      <i className="fa-regular fa-envelope leading-icon"></i>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
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
                        placeholder="Mobile Number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                      />
                    </div>
                  </div>

                  {/* Aadhaar Verification Section */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm space-y-2.5">
                    <label className="block text-xs font-bold text-maintext uppercase tracking-wide">
                      <i className="fa-regular fa-id-card mr-2 text-slate-700"></i>Aadhaar Verification
                    </label>
                    <select className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-maintext focus:border-primary outline-none bg-white">
                      <option value="digilocker">Fetch via DigiLocker (Instant)</option>
                      <option value="otp">Verify via Aadhaar OTP</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength="12"
                        value={aadhaarNum}
                        onChange={(e) => setAadhaarNum(e.target.value)}
                        placeholder="12-Digit Aadhaar No."
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs text-maintext outline-none focus:border-primary bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => alert('OTP sent to registered Aadhaar mobile number.')}
                        className="bg-white border border-slate-300 text-slate-800 font-semibold px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-xs whitespace-nowrap shadow-sm"
                      >
                        Get OTP
                      </button>
                    </div>
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

                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-lock leading-icon"></i>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create Password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                    />
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

              {/* 2. Doctor Sign Up */}
              {role === 'doctor' && (
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-user-doctor leading-icon"></i>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name (with Title, e.g., Dr. Sarah Jenkins)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="input-icon-wrapper">
                      <i className="fa-regular fa-envelope leading-icon"></i>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Professional Email"
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
                        placeholder="Mobile Number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 space-y-2">
                    <label className="block text-xs font-bold text-maintext uppercase tracking-wide">
                      <i className="fa-solid fa-certificate mr-2 text-amber-600"></i>NMC Verification
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={nmcId}
                        onChange={(e) => setNmcId(e.target.value)}
                        placeholder="NMC Registration No. (e.g. NMC-2018-99412)"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs text-maintext focus:border-primary outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => alert('NMC credential record verified successfully.')}
                        className="bg-white border border-amber-300 text-amber-700 font-semibold px-3 py-2 rounded-lg hover:bg-amber-50 text-xs whitespace-nowrap shadow-sm"
                      >
                        Check Registry
                      </button>
                    </div>
                  </div>

                  <div className="input-icon-wrapper">
                    <i className="fa-solid fa-lock leading-icon"></i>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create Secure Password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-maintext placeholder-sectext focus:border-primary outline-none transition-all input-with-icon bg-white/80"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-primary/25 flex justify-center items-center gap-2 text-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Doctor Application <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 3. Hospital Sign Up */}
              {role === 'hospital' && (
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
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

                  <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-2">
                    <label className="block text-xs font-bold text-maintext uppercase tracking-wide">
                      <i className="fa-solid fa-file-contract mr-2 text-emerald-700"></i>Facility Authorization
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={hospitalRegNo}
                        onChange={(e) => setHospitalRegNo(e.target.value)}
                        placeholder="State Health Reg. No. (e.g. RJ-MED-2014-991)"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs text-maintext focus:border-primary outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => alert('Facility accreditation certificate verified.')}
                        className="bg-white border border-emerald-300 text-emerald-800 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 text-xs whitespace-nowrap shadow-sm"
                      >
                        Verify Doc
                      </button>
                    </div>
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
