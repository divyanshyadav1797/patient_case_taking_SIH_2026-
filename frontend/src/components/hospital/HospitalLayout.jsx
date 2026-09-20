import React from 'react';
import { Outlet } from 'react-router-dom';
import { HospitalProvider } from '../../context/HospitalContext';
import HospitalSidebar from './HospitalSidebar';
import HospitalHeader from './HospitalHeader';
import '../../styles/hospital.css';

export default function HospitalLayout() {
  return (
    <HospitalProvider>
      <div className="hospital-portal">
        <div className="app-layout">
          <HospitalSidebar />
          <div className="main-wrapper">
            <HospitalHeader />
            <main className="main-content" id="mainContentView">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </HospitalProvider>
  );
}
