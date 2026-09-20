import React from 'react';
import { Outlet } from 'react-router-dom';
import { DoctorProvider } from '../../context/DoctorContext';
import DoctorSidebar from './DoctorSidebar';
import DoctorHeader from './DoctorHeader';
import DoctorModals from './DoctorModals';
import DoctorToastContainer from './DoctorToastContainer';
import '../../styles/doctor.css';

export default function DoctorLayout() {
  return (
    <DoctorProvider>
      <div className="doctor-portal">
        <div className="app-layout">
          <DoctorSidebar />
          <div className="main-wrapper">
            <DoctorHeader />
            <main className="main-content" id="mainContent">
              <Outlet />
            </main>
          </div>
          <DoctorModals />
          <DoctorToastContainer />
        </div>
      </div>
    </DoctorProvider>
  );
}
