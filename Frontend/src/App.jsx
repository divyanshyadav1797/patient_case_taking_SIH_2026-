import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// ── Auth ───────────────────────────────────────────────
import Login from './pages/Login/Login';

// ── Patient ────────────────────────────────────────────
import PatientLayout      from './components/patient/PatientLayout';
import PatientDashboard   from './pages/Patient/PatientDashboard';
import PatientAppointments from './pages/Patient/PatientAppointments';
import PatientDoctors     from './pages/Patient/PatientDoctors';
import PatientRecords     from './pages/Patient/PatientRecords';
import PatientMedicines   from './pages/Patient/PatientMedicines';
import PatientSchemes     from './pages/Patient/PatientSchemes';
import PatientMyScheme    from './pages/Patient/PatientMyScheme';
import PatientEmergency   from './pages/Patient/PatientEmergency';
import PatientProfile     from './pages/Patient/PatientProfile';
import PatientSupport     from './pages/Patient/PatientSupport';

// ── Doctor ─────────────────────────────────────────────
import DoctorLayout       from './components/doctor/DoctorLayout';
import DoctorDashboard    from './pages/Doctor/DashboardPage';
import DoctorPatients     from './pages/Doctor/PatientsPage';
import DoctorAppointments from './pages/Doctor/AppointmentsPage';
import DoctorPrescriptions from './pages/Doctor/PrescriptionsPage';
import DoctorMedicalRecords from './pages/Doctor/MedicalRecordsPage';
import DoctorMessages     from './pages/Doctor/MessagesPage';
import DoctorSettings     from './pages/Doctor/SettingsPage';
import DoctorHelp         from './pages/Doctor/HelpPage';

// ── Hospital ───────────────────────────────────────────
import HospitalLayout     from './components/hospital/HospitalLayout';
import HospitalDashboard  from './pages/Hospital/HospitalDashboard';
import HospitalPatients   from './pages/Hospital/HospitalPatients';
import HospitalDoctors    from './pages/Hospital/HospitalDoctors';
import HospitalAppointments from './pages/Hospital/HospitalAppointments';
import HospitalOPD        from './pages/Hospital/HospitalOPD';
import HospitalOperations from './pages/Hospital/HospitalOperations';
import HospitalRecords    from './pages/Hospital/HospitalRecords';
import HospitalStaff      from './pages/Hospital/HospitalStaff';
import HospitalReports    from './pages/Hospital/HospitalReports';
import HospitalSettings   from './pages/Hospital/HospitalSettings';
import HospitalHelp       from './pages/Hospital/HospitalHelp';

// ── Kiosk ──────────────────────────────────────────────
import KioskPage          from './pages/Kiosk/KioskPage';

// ── 404 ───────────────────────────────────────────────
import NotFound           from './pages/NotFound/NotFound';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Quantum Care Error Boundary caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#F8FAFC',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '1.5rem',
            padding: '2.5rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              margin: '0 auto 1.25rem',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              fontSize: '2rem'
            }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#F8FAFC' }}>
              Application Loaded
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              {this.state.error?.message || 'An unexpected rendering issue occurred. Click below to reload or return to the login portal.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  localStorage.removeItem('medicare_auth_session');
                  window.location.href = '/login';
                }}
                style={{
                  background: '#2563EB',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />

            {/* Direct Portal Login Redirects to avoid nested route empty outlet blackholes */}
            <Route path="/patient/login" element={<Navigate to="/login?role=patient" replace />} />
            <Route path="/doctor/login" element={<Navigate to="/login?role=doctor" replace />} />
            <Route path="/hospital/login" element={<Navigate to="/login?role=hospital" replace />} />
            <Route path="/kiosk/login" element={<Navigate to="/login?role=kiosk" replace />} />

          {/* ── Patient Portal ── */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<PatientDashboard />} />
            <Route path="appointments"  element={<PatientAppointments />} />
            <Route path="doctors"       element={<PatientDoctors />} />
            <Route path="records"       element={<PatientRecords />} />
            <Route path="medicines"     element={<PatientMedicines />} />
            <Route path="schemes"       element={<PatientSchemes />} />
            <Route path="my-scheme"     element={<PatientMyScheme />} />
            <Route path="emergency"     element={<PatientEmergency />} />
            <Route path="profile"       element={<PatientProfile />} />
            <Route path="support"       element={<PatientSupport />} />
          </Route>

          {/* ── Doctor Portal ── */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<DoctorDashboard />} />
            <Route path="patients"      element={<DoctorPatients />} />
            <Route path="appointments"  element={<DoctorAppointments />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="records"       element={<DoctorMedicalRecords />} />
            <Route path="messages"      element={<DoctorMessages />} />
            <Route path="settings"      element={<DoctorSettings />} />
            <Route path="help"          element={<DoctorHelp />} />
          </Route>

          {/* ── Hospital Portal ── */}
          <Route
            path="/hospital"
            element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <HospitalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<HospitalDashboard />} />
            <Route path="patients"     element={<HospitalPatients />} />
            <Route path="doctors"      element={<HospitalDoctors />} />
            <Route path="appointments" element={<HospitalAppointments />} />
            <Route path="opd"          element={<HospitalOPD />} />
            <Route path="operations"   element={<HospitalOperations />} />
            <Route path="records"      element={<HospitalRecords />} />
            <Route path="staff"        element={<HospitalStaff />} />
            <Route path="reports"      element={<HospitalReports />} />
            <Route path="settings"     element={<HospitalSettings />} />
            <Route path="help"         element={<HospitalHelp />} />
          </Route>

          {/* ── Kiosk Portal ── */}
          <Route
            path="/kiosk"
            element={
              <ProtectedRoute allowedRoles={['kiosk', 'hospital']}>
                <KioskPage />
              </ProtectedRoute>
            }
          />
          <Route path="/kiosk/dashboard" element={<Navigate to="/kiosk" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
