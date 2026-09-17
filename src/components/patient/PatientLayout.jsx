import React from 'react';
import { Outlet } from 'react-router-dom';
import { PatientProvider, usePatient } from '../../context/PatientContext';
import PatientSidebar from './PatientSidebar';
import PatientTopbar from './PatientTopbar';
import '../../styles/patient.css';

function PatientLayoutInner() {
  const { toastMessage } = usePatient();

  return (
    <div className="patient-portal">
      <div className="app">
        <PatientSidebar />
        <main className="main">
          <PatientTopbar />
          <section className="content" id="content">
            <Outlet />
          </section>
        </main>
      </div>

      {toastMessage && (
        <div id="toast" className="toast show">
          <i className="fa-solid fa-circle-info"></i>
          <span id="toastMessage">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function PatientLayout() {
  return (
    <PatientProvider>
      <PatientLayoutInner />
    </PatientProvider>
  );
}
