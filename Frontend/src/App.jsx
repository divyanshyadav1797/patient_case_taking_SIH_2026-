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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

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
          <Route path="/kiosk" element={<KioskPage />} />
          <Route path="/kiosk/dashboard" element={<Navigate to="/kiosk" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
