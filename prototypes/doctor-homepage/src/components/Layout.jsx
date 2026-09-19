import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Modals from './Modals';
import ToastContainer from './ToastContainer';

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="main-content" id="mainContent">
          <Outlet />
        </main>
      </div>
      <Modals />
      <ToastContainer />
    </div>
  );
}
