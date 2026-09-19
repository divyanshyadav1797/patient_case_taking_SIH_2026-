/**
 * MediCare Hospital Portal - Interactive Administration Logic
 * Plain Vanilla JavaScript implementation
 * Strict scope: HOSPITAL HOMEPAGE/ only
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Navigation & View Routing State
  // -------------------------------------------------------------------------
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');
  const backToDashboardBtns = document.querySelectorAll('.back-to-dashboard-btn');
  
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');

  // Module Headings Dictionary
  const moduleHeadings = {
    'dashboard': {
      title: 'Good morning, Hospital Admin',
      subtitle: 'Here’s your hospital overview for today.'
    },
    'patients': {
      title: 'Patients Management & Admissions',
      subtitle: 'Hospital inpatient and outpatient clinical registry records.'
    },
    'doctors': {
      title: 'Hospital Doctors & Medical Faculty',
      subtitle: 'Consultant availability, rooms, and shift statuses.'
    },
    'appointments': {
      title: 'Master Appointments Schedule',
      subtitle: 'Hospital-wide appointment slots, consultations, and statuses.'
    },
    'opd': {
      title: 'Outpatient Department (OPD) Overview',
      subtitle: 'Live consultation chambers, duty shifts, and availability.'
    },
    'operations': {
      title: 'Operations & Operating Theatres (OT)',
      subtitle: 'Surgical theatre allocations, surgeons, and live procedure statuses.'
    },
    'medical-records': {
      title: 'Electronic Medical Records (EMR)',
      subtitle: 'Clinical discharge summaries, surgical notes, and lab reports.'
    },
    'staff': {
      title: 'Hospital Staff & Clinical Roster',
      subtitle: 'Nursing personnel, pharmacists, technicians, and duty rosters.'
    },
    'reports': {
      title: 'Hospital Analytics & Performance Reports',
      subtitle: 'Monthly clinical visits, wait times, and throughput statistics.'
    },
    'settings': {
      title: 'Hospital System Configuration',
      subtitle: 'Facility parameters, emergency triage protocols, and security access.'
    },
    'help': {
      title: 'Hospital IT & Administration Support',
      subtitle: 'Emergency hotlines, systems desk, and operational FAQs.'
    }
  };

  // Page URL mapping for multi-page feature separation
  const pageMap = {
    'dashboard': 'index.html',
    'patients': 'patients.html',
    'doctors': 'doctors.html',
    'appointments': 'appointments.html',
    'opd': 'opd.html',
    'operations': 'operations.html',
    'medical-records': 'medical-records.html',
    'staff': 'staff.html',
    'reports': 'reports.html',
    'settings': 'settings.html',
    'help': 'help.html'
  };

  /**
   * Switches the active module view without page reload or intrusive toasts
   * Navigates to target HTML page if view is on a separate page
   * @param {string} viewId - ID of the target view (e.g. 'dashboard', 'patients')
   */
  function switchView(viewId) {
    if (!viewId) return;

    // Check if target section exists in the current page DOM
    const targetSection = document.querySelector(`.view-section[data-view="${viewId}"]`);
    if (!targetSection) {
      if (pageMap[viewId]) {
        window.location.href = pageMap[viewId];
        return;
      }
    }

    // 1. Update views
    let viewFound = false;
    viewSections.forEach(section => {
      if (section.getAttribute('data-view') === viewId) {
        section.classList.add('active');
        viewFound = true;
      } else {
        section.classList.remove('active');
      }
    });

    if (!viewFound) {
      const defaultView = document.querySelector('.view-section');
      if (defaultView) {
        defaultView.classList.add('active');
        viewId = defaultView.getAttribute('data-view') || 'dashboard';
      }
    }

    // 2. Update sidebar navigation active indicator
    navLinks.forEach(link => {
      if (link.getAttribute('data-view-id') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 3. Update header titles
    if (moduleHeadings[viewId]) {
      if (pageTitle) pageTitle.textContent = moduleHeadings[viewId].title;
      if (pageSubtitle) pageSubtitle.textContent = moduleHeadings[viewId].subtitle;
    }

    // 4. Close mobile navigation if open
    closeMobileSidebar();

    // 5. Scroll smoothly to top of main view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 6. Re-trigger search on newly opened view if search input has text
    if (globalSearchInput && globalSearchInput.value.trim() !== '') {
      performSearch(globalSearchInput.value.trim().toLowerCase());
    }
  }

  // Bind click event to all sidebar navigation items
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetViewId = link.getAttribute('data-view-id');
      const targetSection = targetViewId ? document.querySelector(`.view-section[data-view="${targetViewId}"]`) : null;
      if (targetSection) {
        e.preventDefault();
        switchView(targetViewId);
      }
      // If target section is on another HTML page, let normal navigation occur
    });
  });

  // Bind click event to all "← Back to Dashboard" buttons
  backToDashboardBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView('dashboard');
    });
  });

  // -------------------------------------------------------------------------
  // 2. "View All" Action Buttons (Navigate to Appropriate Modules)
  // -------------------------------------------------------------------------
  
  // Today's Appointments "View All" -> Navigates to Appointments Module
  const viewAllAppointmentsBtn = document.getElementById('viewAllAppointmentsBtn');
  if (viewAllAppointmentsBtn) {
    viewAllAppointmentsBtn.addEventListener('click', () => {
      switchView('appointments');
    });
  }

  // Operations / OT "View All OT" -> Navigates to Operations Module
  const viewAllOtBtn = document.getElementById('viewAllOtBtn');
  if (viewAllOtBtn) {
    viewAllOtBtn.addEventListener('click', () => {
      switchView('operations');
    });
  }

  // Recent Patient Registrations "View Patients" -> Navigates to Patients Module
  const viewPatientsBtn = document.getElementById('viewPatientsBtn');
  if (viewPatientsBtn) {
    viewPatientsBtn.addEventListener('click', () => {
      switchView('patients');
    });
  }

  // OPD Schedule "View All OPD" -> Navigates to OPD Module
  const viewAllOpdBtn = document.getElementById('viewAllOpdBtn');
  if (viewAllOpdBtn) {
    viewAllOpdBtn.addEventListener('click', () => {
      switchView('opd');
    });
  }

  // Doctor Availability "View Directory" -> Navigates to Doctors Module
  const viewAllDoctorsBtn = document.getElementById('viewAllDoctorsBtn');
  if (viewAllDoctorsBtn) {
    viewAllDoctorsBtn.addEventListener('click', () => {
      switchView('doctors');
    });
  }

  // -------------------------------------------------------------------------
  // 3. Appointment Status Filter Tabs
  // Filters: All, Confirmed, Waiting, Completed (No Upcoming)
  // -------------------------------------------------------------------------
  function setupAppointmentFilters(filterContainerId, tableId) {
    const container = document.getElementById(filterContainerId);
    const table = document.getElementById(tableId);
    if (!container || !table) return;

    const pills = container.querySelectorAll('.filter-pill');
    const rows = table.querySelectorAll('tbody tr');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filterVal = pill.getAttribute('data-filter');

        rows.forEach(row => {
          const rowStatus = row.getAttribute('data-status');
          if (filterVal === 'all' || rowStatus === filterVal) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }

  // Dashboard appointments filter
  setupAppointmentFilters('appointmentsCard', 'appointmentsTable');
  // Module appointments filter
  setupAppointmentFilters('moduleApptFilterPills', 'moduleAppointmentsTable');

  // -------------------------------------------------------------------------
  // 4. Functional Hospital Search
  // Searches patient names, doctor names, departments, OT rooms
  // -------------------------------------------------------------------------
  const globalSearchInput = document.getElementById('globalSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');

  function performSearch(query) {
    // 1. Dashboard View Elements
    const dashApptRows = document.querySelectorAll('#appointmentsTable tbody tr');
    dashApptRows.forEach(r => {
      const match = r.textContent.toLowerCase().includes(query);
      r.style.display = match ? '' : 'none';
    });

    const dashOtRows = document.querySelectorAll('#otScheduleCard .ot-table tbody tr');
    dashOtRows.forEach(r => {
      const match = r.textContent.toLowerCase().includes(query);
      r.style.display = match ? '' : 'none';
    });

    const dashDocItems = document.querySelectorAll('#doctorList .doctor-roster-item');
    dashDocItems.forEach(item => {
      const match = item.textContent.toLowerCase().includes(query);
      item.style.display = match ? 'flex' : 'none';
    });

    const dashOpdRows = document.querySelectorAll('#opdScheduleCard .opd-dept-row');
    dashOpdRows.forEach(row => {
      const match = row.textContent.toLowerCase().includes(query);
      row.style.display = match ? 'flex' : 'none';
    });

    // 2. Module Master Tables
    const moduleTables = [
      'patientsMasterTable',
      'doctorsMasterTable',
      'moduleAppointmentsTable',
      'opdMasterTable',
      'operationsMasterTable',
      'medicalRecordsTable',
      'staffMasterTable'
    ];

    moduleTables.forEach(tId => {
      const t = document.getElementById(tId);
      if (t) {
        const rows = t.querySelectorAll('tbody tr');
        rows.forEach(r => {
          const match = r.textContent.toLowerCase().includes(query);
          r.style.display = match ? '' : 'none';
        });
      }
    });
  }

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();

      if (query.length > 0) {
        if (searchClearBtn) searchClearBtn.classList.add('visible');
      } else {
        if (searchClearBtn) searchClearBtn.classList.remove('visible');
      }

      performSearch(query);
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        globalSearchInput.value = '';
        searchClearBtn.classList.remove('visible');
        performSearch('');
        globalSearchInput.focus();
      });
    }
  }

  // -------------------------------------------------------------------------
  // 5. Notifications Dropdown (Realistic Hospital Alerts)
  // -------------------------------------------------------------------------
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const notifBadge = document.getElementById('notifBadge');
  const unreadNotifCount = document.getElementById('unreadNotifCount');
  const markReadBtn = document.getElementById('markReadBtn');
  const notificationItems = document.querySelectorAll('.notification-item');

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = notificationDropdown.classList.contains('active');
      closeAllDropdowns();
      if (!isActive) {
        notificationDropdown.classList.add('active');
        notificationBtn.setAttribute('aria-expanded', 'true');
      }
    });

    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        notificationItems.forEach(item => item.classList.remove('unread'));
        if (notifBadge) notifBadge.style.display = 'none';
        if (unreadNotifCount) unreadNotifCount.textContent = '0 unread notifications';
      });
    }

    // Clicking individual notifications jumps to the relevant section
    notificationItems.forEach(item => {
      item.addEventListener('click', () => {
        item.classList.remove('unread');
        const notifType = item.getAttribute('data-notif-type');
        if (notifType === 'patient') switchView('patients');
        else if (notifType === 'ot') switchView('operations');
        else if (notifType === 'doctor') switchView('doctors');
        else if (notifType === 'appointment') switchView('appointments');
        closeAllDropdowns();
      });
    });
  }

  // -------------------------------------------------------------------------
  // 6. Admin Profile Dropdown (Profile, Hospital Information, Settings, Logout)
  // -------------------------------------------------------------------------
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  const menuOptionProfile = document.getElementById('menuOptionProfile');
  const menuOptionHospitalInfo = document.getElementById('menuOptionHospitalInfo');
  const menuOptionSettings = document.getElementById('menuOptionSettings');
  const logoutBtn = document.getElementById('logoutBtn');

  // Modals for Profile options
  const adminProfileModal = document.getElementById('adminProfileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const closeProfileModalBottom = document.getElementById('closeProfileModalBottom');

  const hospitalInfoModal = document.getElementById('hospitalInfoModal');
  const closeHospInfoModal = document.getElementById('closeHospInfoModal');
  const closeHospInfoModalBottom = document.getElementById('closeHospInfoModalBottom');

  const logoutConfirmModal = document.getElementById('logoutConfirmModal');
  const closeLogoutModal = document.getElementById('closeLogoutModal');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = profileDropdown.classList.contains('active');
      closeAllDropdowns();
      if (!isActive) {
        profileDropdown.classList.add('active');
        profileBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // 1. Profile option
    if (menuOptionProfile) {
      menuOptionProfile.addEventListener('click', () => {
        closeAllDropdowns();
        openModal(adminProfileModal);
      });
    }

    // 2. Hospital Information option
    if (menuOptionHospitalInfo) {
      menuOptionHospitalInfo.addEventListener('click', () => {
        closeAllDropdowns();
        openModal(hospitalInfoModal);
      });
    }

    // 3. Settings option
    if (menuOptionSettings) {
      menuOptionSettings.addEventListener('click', () => {
        closeAllDropdowns();
        switchView('settings');
      });
    }

    // 4. Logout option
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        closeAllDropdowns();
        openModal(logoutConfirmModal);
      });
    }
  }

  // Modal Close Handlers
  if (closeProfileModal) closeProfileModal.addEventListener('click', () => closeModal(adminProfileModal));
  if (closeProfileModalBottom) closeProfileModalBottom.addEventListener('click', () => closeModal(adminProfileModal));
  if (adminProfileModal) {
    adminProfileModal.addEventListener('click', (e) => {
      if (e.target === adminProfileModal) closeModal(adminProfileModal);
    });
  }

  if (closeHospInfoModal) closeHospInfoModal.addEventListener('click', () => closeModal(hospitalInfoModal));
  if (closeHospInfoModalBottom) closeHospInfoModalBottom.addEventListener('click', () => closeModal(hospitalInfoModal));
  if (hospitalInfoModal) {
    hospitalInfoModal.addEventListener('click', (e) => {
      if (e.target === hospitalInfoModal) closeModal(hospitalInfoModal);
    });
  }

  if (closeLogoutModal) closeLogoutModal.addEventListener('click', () => closeModal(logoutConfirmModal));
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', () => closeModal(logoutConfirmModal));
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      closeModal(logoutConfirmModal);
      // Clean status update
      const liveText = document.querySelector('.live-text');
      if (liveText) {
        liveText.innerHTML = 'Administrative Session: <strong>Logged Out (Guest Preview Mode)</strong>';
      }
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 300);
    });
  }
  if (logoutConfirmModal) {
    logoutConfirmModal.addEventListener('click', (e) => {
      if (e.target === logoutConfirmModal) closeModal(logoutConfirmModal);
    });
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function closeAllDropdowns() {
    if (notificationDropdown) notificationDropdown.classList.remove('active');
    if (notificationBtn) notificationBtn.setAttribute('aria-expanded', 'false');
    if (profileDropdown) profileDropdown.classList.remove('active');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
  }

  // Global click outside to close dropdowns
  document.addEventListener('click', (e) => {
    if (notificationDropdown && !notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
      notificationDropdown.classList.remove('active');
      if (notificationBtn) notificationBtn.setAttribute('aria-expanded', 'false');
    }
    if (profileDropdown && !profileDropdown.contains(e.target) && e.target !== profileBtn) {
      profileDropdown.classList.remove('active');
      if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(adminProfileModal);
      closeModal(hospitalInfoModal);
      closeModal(logoutConfirmModal);
      closeAllDropdowns();
      closeMobileSidebar();
    }
  });

  // -------------------------------------------------------------------------
  // 7. Mobile Navigation Drawer Handling
  // -------------------------------------------------------------------------
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('mobile-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', openMobileSidebar);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // -------------------------------------------------------------------------
  // 8. Live Clock
  // -------------------------------------------------------------------------
  const liveClock = document.getElementById('liveClock');
  function updateLiveClock() {
    if (!liveClock) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    liveClock.textContent = `${timeStr} • ${dateStr}`;
  }
  updateLiveClock();
  setInterval(updateLiveClock, 30000);

  // Initialize Default State: Active View for current page (Portal modules only)
  const currentSection = document.querySelector('.view-section.active') || document.querySelector('.view-section');
  if (currentSection) {
    const initialViewId = currentSection.getAttribute('data-view') || 'dashboard';
    switchView(initialViewId);
  }

  // -------------------------------------------------------------------------
  // 9. Hospital Login Workflow (login.html)
  // -------------------------------------------------------------------------
  const hospitalLoginForm = document.getElementById('hospitalLoginForm');
  if (hospitalLoginForm) {
    const regNumInput = document.getElementById('hospitalRegNumber');
    const pinInput = document.getElementById('hospitalPin');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginAlertBox = document.getElementById('loginAlertBox');
    const loginAlertText = document.getElementById('loginAlertText');
    const togglePinBtn = document.getElementById('togglePinBtn');
    const fillDemoBtn = document.getElementById('fillDemoBtn');

    // Forgot PIN elements
    const forgotPinBtn = document.getElementById('forgotPinBtn');
    const forgotPinModal = document.getElementById('forgotPinModal');
    const closeForgotPinModal = document.getElementById('closeForgotPinModal');
    const closeForgotPinModalBtn = document.getElementById('closeForgotPinModalBtn');

    // Show/hide PIN toggle
    if (togglePinBtn && pinInput) {
      togglePinBtn.addEventListener('click', () => {
        const isPassword = pinInput.type === 'password';
        pinInput.type = isPassword ? 'text' : 'password';
        togglePinBtn.setAttribute('aria-label', isPassword ? 'Hide PIN' : 'Show PIN');
        togglePinBtn.innerHTML = isPassword
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      });
    }

    // Quick Fill Demo Credentials
    if (fillDemoBtn && regNumInput && pinInput) {
      fillDemoBtn.addEventListener('click', () => {
        regNumInput.value = 'MC-MH-40001';
        pinInput.value = '1234';
        clearFieldErrors();
        hideAlert();
        regNumInput.focus();
      });
    }

    // Forgot PIN Modal Handlers
    if (forgotPinBtn && forgotPinModal) {
      forgotPinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(forgotPinModal);
      });
    }
    if (closeForgotPinModal) closeForgotPinModal.addEventListener('click', () => closeModal(forgotPinModal));
    if (closeForgotPinModalBtn) closeForgotPinModalBtn.addEventListener('click', () => closeModal(forgotPinModal));
    if (forgotPinModal) {
      forgotPinModal.addEventListener('click', (e) => {
        if (e.target === forgotPinModal) closeModal(forgotPinModal);
      });
    }

    function showAlert(type, message) {
      if (!loginAlertBox || !loginAlertText) return;
      loginAlertBox.className = `auth-alert-box ${type} active`;
      loginAlertText.textContent = message;
    }

    function hideAlert() {
      if (!loginAlertBox) return;
      loginAlertBox.className = 'auth-alert-box';
    }

    function clearFieldErrors() {
      const inputs = [regNumInput, pinInput];
      inputs.forEach(input => {
        if (input) {
          input.classList.remove('is-invalid');
          const errSpan = document.getElementById(`${input.id}Error`);
          if (errSpan) errSpan.classList.remove('active');
        }
      });
    }

    function setFieldError(input, message) {
      if (!input) return;
      input.classList.add('is-invalid');
      const errSpan = document.getElementById(`${input.id}Error`);
      if (errSpan) {
        errSpan.textContent = message;
        errSpan.classList.add('active');
      }
    }

    [regNumInput, pinInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          inp.classList.remove('is-invalid');
          const errSpan = document.getElementById(`${inp.id}Error`);
          if (errSpan) errSpan.classList.remove('active');
          hideAlert();
        });
      }
    });

    hospitalLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFieldErrors();
      hideAlert();

      const regVal = regNumInput ? regNumInput.value.trim() : '';
      const pinVal = pinInput ? pinInput.value.trim() : '';

      // Validation
      let hasError = false;
      if (!regVal) {
        setFieldError(regNumInput, 'Please enter your Hospital Registration Number.');
        showAlert('error', 'Please enter your Hospital Registration Number.');
        hasError = true;
      }

      if (!pinVal) {
        setFieldError(pinInput, 'Please enter your PIN.');
        if (!hasError) showAlert('error', 'Please enter your PIN.');
        hasError = true;
      }

      if (hasError) return;

      // Loading State
      if (loginSubmitBtn) {
        loginSubmitBtn.classList.add('loading');
        loginSubmitBtn.disabled = true;
        const btnText = loginSubmitBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Verifying credentials...';
      }
      if (regNumInput) regNumInput.disabled = true;
      if (pinInput) pinInput.disabled = true;

      // Check credentials (simulate async auth)
      setTimeout(() => {
        // Accepted credentials:
        // 1. Standard Hospital Facility Registry Code (MC-MH-40001 / 1234)
        // 2. Demo credentials with PIN 1234 or any stored hospital in localStorage
        const normalizedReg = regVal.toUpperCase();
        let isValid = false;

        if (normalizedReg === 'MC-MH-40001' && pinVal === '1234') {
          isValid = true;
        } else {
          try {
            const approvedList = JSON.parse(localStorage.getItem('medicare_approved_hospitals') || '[]');
            const match = approvedList.find(h => h.regNumber && h.regNumber.toUpperCase() === normalizedReg && h.pin === pinVal);
            if (match) isValid = true;
          } catch (err) {
            console.warn('Error reading approved hospitals', err);
          }
        }

        if (isValid) {
          showAlert('success', 'Hospital credentials verified. Opening Hospital Dashboard...');
          sessionStorage.setItem('medicare_auth', JSON.stringify({
            regNumber: normalizedReg,
            authenticated: true,
            authTime: new Date().toISOString()
          }));
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 600);
        } else {
          // Reset loading state
          if (loginSubmitBtn) {
            loginSubmitBtn.classList.remove('loading');
            loginSubmitBtn.disabled = false;
            const btnText = loginSubmitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Sign In to Hospital Portal';
          }
          if (regNumInput) regNumInput.disabled = false;
          if (pinInput) pinInput.disabled = false;

          showAlert('error', 'Invalid Hospital Registration Number or PIN.');
          setFieldError(regNumInput, 'Invalid credentials');
          setFieldError(pinInput, 'Invalid credentials');
        }
      }, 750);
    });
  }

  // -------------------------------------------------------------------------
  // 10. Hospital Registration Request Workflow (register.html)
  // -------------------------------------------------------------------------
  const hospitalRegisterForm = document.getElementById('hospitalRegisterForm');
  if (hospitalRegisterForm) {
    const regConfirmationView = document.getElementById('regConfirmationView');
    const submitRegBtn = document.getElementById('submitRegBtn');
    const registerAlertBox = document.getElementById('registerAlertBox');
    const registerAlertText = document.getElementById('registerAlertText');
    const submitAnotherBtn = document.getElementById('submitAnotherBtn');

    const fields = {
      hospitalName: document.getElementById('hospitalName'),
      hospitalLicence: document.getElementById('hospitalLicence'),
      hospitalPhone: document.getElementById('hospitalPhone'),
      hospitalEmail: document.getElementById('hospitalEmail'),
      contactPerson: document.getElementById('contactPerson'),
      hospitalAddress: document.getElementById('hospitalAddress')
    };

    function showRegAlert(type, message) {
      if (!registerAlertBox || !registerAlertText) return;
      registerAlertBox.className = `auth-alert-box ${type} active`;
      registerAlertText.textContent = message;
    }

    function hideRegAlert() {
      if (!registerAlertBox) return;
      registerAlertBox.className = 'auth-alert-box';
    }

    function clearRegErrors() {
      Object.values(fields).forEach(input => {
        if (input) {
          input.classList.remove('is-invalid');
          const errSpan = document.getElementById(`${input.id}Error`);
          if (errSpan) errSpan.classList.remove('active');
        }
      });
    }

    Object.values(fields).forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const errSpan = document.getElementById(`${input.id}Error`);
          if (errSpan) errSpan.classList.remove('active');
          hideRegAlert();
        });
      }
    });

    hospitalRegisterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearRegErrors();
      hideRegAlert();

      let hasError = false;
      let firstErrorField = null;

      // Validate Hospital Name
      if (!fields.hospitalName.value.trim()) {
        fields.hospitalName.classList.add('is-invalid');
        const errSpan = document.getElementById('hospitalNameError');
        if (errSpan) { errSpan.textContent = 'Please enter the hospital name.'; errSpan.classList.add('active'); }
        hasError = true;
        if (!firstErrorField) firstErrorField = fields.hospitalName;
      }

      // Validate Hospital Licence Number
      if (!fields.hospitalLicence.value.trim()) {
        fields.hospitalLicence.classList.add('is-invalid');
        const errSpan = document.getElementById('hospitalLicenceError');
        if (errSpan) { errSpan.textContent = 'Please enter the hospital licence number.'; errSpan.classList.add('active'); }
        hasError = true;
        if (!firstErrorField) firstErrorField = fields.hospitalLicence;
      }

      // Validate Phone Number
      const phoneVal = fields.hospitalPhone.value.trim();
      if (!phoneVal) {
        fields.hospitalPhone.classList.add('is-invalid');
        const errSpan = document.getElementById('hospitalPhoneError');
        if (errSpan) { errSpan.textContent = 'Please enter a contact phone number.'; errSpan.classList.add('active'); }
        hasError = true;
        if (!firstErrorField) firstErrorField = fields.hospitalPhone;
      } else if (phoneVal.length < 7) {
        fields.hospitalPhone.classList.add('is-invalid');
        const errSpan = document.getElementById('hospitalPhoneError');
        if (errSpan) { errSpan.textContent = 'Please enter a valid telephone number.'; errSpan.classList.add('active'); }
        hasError = true;
        if (!firstErrorField) firstErrorField = fields.hospitalPhone;
      }

      // Validate Email
      const emailVal = fields.hospitalEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        fields.hospitalEmail.classList.add('is-invalid');
        const errSpan = document.getElementById('hospitalEmailError');
        if (errSpan) { errSpan.textContent = 'Please enter the official hospital email.'; errSpan.classList.add('active'); }
        hasError = true;
        if (!firstErrorField) firstErrorField = fields.hospitalEmail;
      } else if (!emailRegex.test(emailVal)) {
        fields.hospitalEmail.classList.add('is-invalid');
        const errSpan = document.getElementById('hospitalEmailError');
        if (errSpan) { errSpan.textContent = 'Please enter a valid official email address.'; errSpan.classList.add('active'); }
        hasError = true;
        if (!firstErrorField) firstErrorField = fields.hospitalEmail;
      }

      // Validate Contact Person Name
      if (!fields.contactPerson.value.trim()) {
        fields.contactPerson.classList.add('is-invalid');
        const errSpan = document.getElementById('contactPersonError');
        if (errSpan) { errSpan.textContent = 'Please enter the authorized contact person name.'; errSpan.classList.add('active'); }
        hasError = true;
        if (!firstErrorField) firstErrorField = fields.contactPerson;
      }

      // Validate Hospital Address
      if (!fields.hospitalAddress.value.trim()) {
        fields.hospitalAddress.classList.add('is-invalid');
        const errSpan = document.getElementById('hospitalAddressError');
        if (errSpan) { errSpan.textContent = 'Please enter the complete physical hospital address.'; errSpan.classList.add('active'); }
        hasError = true;
        if (!firstErrorField) firstErrorField = fields.hospitalAddress;
      }

      if (hasError) {
        showRegAlert('error', 'Please complete all required fields with valid details.');
        if (firstErrorField) firstErrorField.focus();
        return;
      }

      // Start submission loading state
      if (submitRegBtn) {
        submitRegBtn.classList.add('loading');
        submitRegBtn.disabled = true;
        const btnText = submitRegBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Submitting Request...';
      }

      // Simulate async registration submission
      setTimeout(() => {
        // Generate Request State (Pending Verification)
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const reqId = `REQ-MH-${randomNum}`;
        const submissionDate = new Date().toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        const newRequest = {
          requestId: reqId,
          hospitalName: fields.hospitalName.value.trim(),
          licenceNumber: fields.hospitalLicence.value.trim(),
          phone: fields.hospitalPhone.value.trim(),
          email: fields.hospitalEmail.value.trim(),
          contactPerson: fields.contactPerson.value.trim(),
          address: fields.hospitalAddress.value.trim(),
          status: 'Pending Verification',
          submittedAt: submissionDate
        };

        // Store request in localStorage for frontend demonstration
        try {
          const reqs = JSON.parse(localStorage.getItem('medicare_registration_requests') || '[]');
          reqs.push(newRequest);
          localStorage.setItem('medicare_registration_requests', JSON.stringify(reqs));
        } catch (e) {
          console.warn('LocalStorage error', e);
        }

        // Populate Confirmation Card
        const confHospitalName = document.getElementById('confHospitalName');
        const confLicenceNumber = document.getElementById('confLicenceNumber');
        const confRegisteredEmail = document.getElementById('confRegisteredEmail');
        const confContactPerson = document.getElementById('confContactPerson');
        const confRequestId = document.getElementById('confRequestId');
        const confTimestamp = document.getElementById('confTimestamp');
        const confStatus = document.getElementById('confStatus');

        if (confHospitalName) confHospitalName.textContent = newRequest.hospitalName;
        if (confLicenceNumber) confLicenceNumber.textContent = newRequest.licenceNumber;
        if (confRegisteredEmail) confRegisteredEmail.textContent = newRequest.email;
        if (confContactPerson) confContactPerson.textContent = newRequest.contactPerson;
        if (confRequestId) confRequestId.textContent = newRequest.requestId;
        if (confTimestamp) confTimestamp.textContent = newRequest.submittedAt;
        if (confStatus) confStatus.textContent = 'Pending Verification';

        // Switch to Confirmation Screen
        if (hospitalRegisterForm) hospitalRegisterForm.style.display = 'none';
        const regCardHeader = document.getElementById('regCardHeader');
        if (regCardHeader) regCardHeader.style.display = 'none';
        if (registerAlertBox) registerAlertBox.style.display = 'none';
        if (regConfirmationView) regConfirmationView.classList.add('active');

        // Scroll to top of card smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 750);
    });

    if (submitAnotherBtn) {
      submitAnotherBtn.addEventListener('click', () => {
        hospitalRegisterForm.reset();
        clearRegErrors();
        hideRegAlert();
        if (submitRegBtn) {
          submitRegBtn.classList.remove('loading');
          submitRegBtn.disabled = false;
          const btnText = submitRegBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'Submit Registration Request';
        }
        if (regConfirmationView) regConfirmationView.classList.remove('active');
        if (hospitalRegisterForm) hospitalRegisterForm.style.display = 'flex';
        const regCardHeader = document.getElementById('regCardHeader');
        if (regCardHeader) regCardHeader.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // -------------------------------------------------------------------------
  // 11. Add Doctor Feature & Dynamic Doctor Registry
  // (renderCustomDoctors is defined in section 12 with Edit button support)
  // -------------------------------------------------------------------------

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Add Doctor Form Handler (add-doctor.html)
  const addDoctorForm = document.getElementById('addDoctorForm');
  if (addDoctorForm) {
    const formCard = document.getElementById('addDoctorFormCard');
    const successCard = document.getElementById('doctorSuccessCard');
    const submitBtn = document.getElementById('addDoctorSubmitBtn');
    const alertBox = document.getElementById('addDoctorAlertBox');
    const alertText = document.getElementById('addDoctorAlertText');
    const addAnotherBtn = document.getElementById('addAnotherDoctorBtn');

    // Inputs
    const f = {
      name: document.getElementById('doctorName'),
      gender: document.getElementById('doctorGender'),
      dob: document.getElementById('doctorDob'),
      phone: document.getElementById('doctorPhone'),
      email: document.getElementById('doctorEmail'),
      regNumber: document.getElementById('doctorRegNumber'),
      specialization: document.getElementById('doctorSpecialization'),
      qualification: document.getElementById('doctorQualification'),
      experience: document.getElementById('doctorExperience'),
      department: document.getElementById('doctorDepartment'),
      designation: document.getElementById('doctorDesignation'),
      joiningDate: document.getElementById('doctorJoiningDate'),
      fee: document.getElementById('doctorFee'),
      address: document.getElementById('doctorAddress'),
      emergencyContact: document.getElementById('doctorEmergencyContact'),
      loginId: document.getElementById('doctorLoginId'),
      tempPassword: document.getElementById('doctorTempPassword')
    };

    // Clear error on input
    Object.values(f).forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const err = document.getElementById(input.id + 'Error');
          if (err) err.classList.remove('active');
          hideAddDocAlert();
        });
        input.addEventListener('change', () => {
          input.classList.remove('is-invalid');
          const err = document.getElementById(input.id + 'Error');
          if (err) err.classList.remove('active');
          hideAddDocAlert();
        });
      }
    });

    function showAddDocAlert(msg) {
      if (!alertBox || !alertText) return;
      alertBox.className = 'auth-alert-box error active';
      alertText.textContent = msg;
    }

    function hideAddDocAlert() {
      if (!alertBox) return;
      alertBox.className = 'auth-alert-box';
    }

    function markError(input, msg) {
      if (!input) return;
      input.classList.add('is-invalid');
      const err = document.getElementById(input.id + 'Error');
      if (err) {
        err.textContent = msg;
        err.classList.add('active');
      }
    }

    addDoctorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAddDocAlert();
      let hasError = false;
      let firstErr = null;

      // 1. Doctor name cannot be empty
      if (!f.name || !f.name.value.trim()) {
        markError(f.name, "Please enter the doctor's full name.");
        hasError = true;
        if (!firstErr) firstErr = f.name;
      }

      // 2. Phone number cannot be empty
      if (!f.phone || !f.phone.value.trim()) {
        markError(f.phone, "Please enter a valid phone number.");
        hasError = true;
        if (!firstErr) firstErr = f.phone;
      }

      // 3. Email must have a valid format
      const emailVal = f.email ? f.email.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        markError(f.email, "Please enter an email address.");
        hasError = true;
        if (!firstErr) firstErr = f.email;
      } else if (!emailRegex.test(emailVal)) {
        markError(f.email, "Please enter a valid email address.");
        hasError = true;
        if (!firstErr) firstErr = f.email;
      }

      // 4. Medical Registration Number cannot be empty
      if (!f.regNumber || !f.regNumber.value.trim()) {
        markError(f.regNumber, "Please enter the medical registration number.");
        hasError = true;
        if (!firstErr) firstErr = f.regNumber;
      }

      // 5. Specialization must be selected
      if (!f.specialization || !f.specialization.value.trim()) {
        markError(f.specialization, "Please select a specialization.");
        hasError = true;
        if (!firstErr) firstErr = f.specialization;
      }

      // 6. Qualification cannot be empty
      if (!f.qualification || !f.qualification.value.trim()) {
        markError(f.qualification, "Please enter the medical qualification.");
        hasError = true;
        if (!firstErr) firstErr = f.qualification;
      }

      // 7. Department must be selected
      if (!f.department || !f.department.value.trim()) {
        markError(f.department, "Please select a department.");
        hasError = true;
        if (!firstErr) firstErr = f.department;
      }

      // 8. Joining Date cannot be empty
      if (!f.joiningDate || !f.joiningDate.value.trim()) {
        markError(f.joiningDate, "Please select a joining date.");
        hasError = true;
        if (!firstErr) firstErr = f.joiningDate;
      }

      // 9. Login ID cannot be empty
      if (!f.loginId || !f.loginId.value.trim()) {
        markError(f.loginId, "Please create a Doctor Login ID.");
        hasError = true;
        if (!firstErr) firstErr = f.loginId;
      }

      // 10. Temporary Password cannot be empty
      if (!f.tempPassword || !f.tempPassword.value.trim()) {
        markError(f.tempPassword, "Please provide a temporary password.");
        hasError = true;
        if (!firstErr) firstErr = f.tempPassword;
      }

      if (hasError) {
        showAddDocAlert("Please correct the errors in the required fields below.");
        if (firstErr) firstErr.focus();
        return;
      }

      // Loading state
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        const txt = submitBtn.querySelector('.btn-text');
        if (txt) txt.textContent = 'Adding Doctor...';
      }

      setTimeout(() => {
        const newDoctor = {
          id: 'DOC-' + Math.floor(1000 + Math.random() * 9000),
          name: f.name.value.trim(),
          gender: f.gender ? f.gender.value : '',
          dob: f.dob ? f.dob.value : '',
          phone: f.phone.value.trim(),
          email: f.email.value.trim(),
          regNumber: f.regNumber.value.trim(),
          specialization: f.specialization.value,
          qualification: f.qualification.value.trim(),
          experience: f.experience ? f.experience.value.trim() : '',
          department: f.department.value,
          designation: (f.designation && f.designation.value.trim()) ? f.designation.value.trim() : 'Consultant Specialist',
          joiningDate: f.joiningDate.value,
          fee: f.fee ? f.fee.value.trim() : '',
          address: f.address ? f.address.value.trim() : '',
          emergencyContact: f.emergencyContact ? f.emergencyContact.value.trim() : '',
          loginId: f.loginId.value.trim(),
          tempPassword: f.tempPassword.value.trim(),
          createdAt: new Date().toISOString()
        };

        // Save to localStorage
        try {
          const list = JSON.parse(localStorage.getItem('medicare_custom_doctors') || '[]');
          list.unshift(newDoctor);
          localStorage.setItem('medicare_custom_doctors', JSON.stringify(list));
        } catch (e) {
          console.warn('LocalStorage error', e);
        }

        // Populate success confirmation
        const sName = document.getElementById('successDocName');
        const sSpec = document.getElementById('successDocSpecialization');
        const sDept = document.getElementById('successDocDepartment');
        const sReg = document.getElementById('successDocRegNumber');
        const sLogin = document.getElementById('successDocLoginId');

        if (sName) sName.textContent = newDoctor.name;
        if (sSpec) sSpec.textContent = newDoctor.specialization;
        if (sDept) sDept.textContent = newDoctor.department;
        if (sReg) sReg.textContent = newDoctor.regNumber;
        if (sLogin) sLogin.textContent = newDoctor.loginId;

        // Toggle views
        if (formCard) formCard.style.display = 'none';
        if (successCard) successCard.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 650);
    });

    if (addAnotherBtn) {
      addAnotherBtn.addEventListener('click', () => {
        addDoctorForm.reset();
        hideAddDocAlert();
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          const txt = submitBtn.querySelector('.btn-text');
          if (txt) txt.textContent = 'Add Doctor';
        }
        if (successCard) successCard.classList.remove('active');
        if (formCard) formCard.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // -------------------------------------------------------------------------
  // 12. Edit Doctor Feature (edit-doctor.html)
  // -------------------------------------------------------------------------

  /**
   * Static data for the 7 built-in doctors hardcoded in doctors.html.
   * Keyed by data-doc-id attribute on the table rows.
   * Stored/overridden in localStorage under key: medicare_static_doctor_edits
   */
  const STATIC_DOCTOR_DEFAULTS = {
    'DOC-RS-101': {
      id: 'DOC-RS-101',
      name: 'Dr. Raj Sharma',
      gender: 'Male',
      dob: '',
      phone: '+91 98200 11001',
      email: 'raj.sharma@medicare.org',
      address: 'A-12, Doctors Colony, Mumbai',
      emergencyContact: '+91 98200 11002',
      regNumber: 'MCI-2008-44501',
      qualification: 'MD, DM (Cardiology)',
      specialization: 'Cardiologist',
      experience: '18',
      department: 'Cardiology',
      designation: 'Senior Consultant',
      joiningDate: '2010-03-15',
      fee: '1200',
      loginId: 'DOC-RS-101',
      status: 'Active',
      isStatic: true
    },
    'DOC-AM-102': {
      id: 'DOC-AM-102',
      name: 'Dr. Ananya Mehta',
      gender: 'Female',
      dob: '',
      phone: '+91 98200 22001',
      email: 'ananya.mehta@medicare.org',
      address: 'B-4, Silver Heights, Pune',
      emergencyContact: '+91 98200 22002',
      regNumber: 'MCI-2012-55210',
      qualification: 'MD (Internal Medicine)',
      specialization: 'General Physician',
      experience: '13',
      department: 'General Medicine',
      designation: 'Consultant',
      joiningDate: '2013-06-01',
      fee: '800',
      loginId: 'DOC-AM-102',
      status: 'Active',
      isStatic: true
    },
    'DOC-VS-103': {
      id: 'DOC-VS-103',
      name: 'Dr. Vikram Singh',
      gender: 'Male',
      dob: '',
      phone: '+91 98200 33001',
      email: 'vikram.singh@medicare.org',
      address: 'C-7, Green Park, Delhi',
      emergencyContact: '+91 98200 33002',
      regNumber: 'MCI-2010-66320',
      qualification: 'MS (Orthopedics)',
      specialization: 'Orthopedic',
      experience: '15',
      department: 'Orthopedics',
      designation: 'Senior Consultant',
      joiningDate: '2011-09-20',
      fee: '1000',
      loginId: 'DOC-VS-103',
      status: 'Active',
      isStatic: true
    },
    'DOC-PP-104': {
      id: 'DOC-PP-104',
      name: 'Dr. Priya Patel',
      gender: 'Female',
      dob: '',
      phone: '+91 98200 44001',
      email: 'priya.patel@medicare.org',
      address: 'D-21, Sunshine Residency, Ahmedabad',
      emergencyContact: '+91 98200 44002',
      regNumber: 'MCI-2014-77430',
      qualification: 'MD, DGO (Obstetrics & Gynecology)',
      specialization: 'Gynecologist',
      experience: '11',
      department: 'Gynecology',
      designation: 'Consultant',
      joiningDate: '2014-11-05',
      fee: '900',
      loginId: 'DOC-PP-104',
      status: 'Active',
      isStatic: true
    },
    'DOC-SK-105': {
      id: 'DOC-SK-105',
      name: 'Dr. Sameer Khan',
      gender: 'Male',
      dob: '',
      phone: '+91 98200 55001',
      email: 'sameer.khan@medicare.org',
      address: 'E-9, Lotus Towers, Hyderabad',
      emergencyContact: '+91 98200 55002',
      regNumber: 'MCI-2016-88540',
      qualification: 'MD (Dermatology)',
      specialization: 'Dermatologist',
      experience: '9',
      department: 'Dermatology',
      designation: 'Consultant',
      joiningDate: '2016-04-10',
      fee: '700',
      loginId: 'DOC-SK-105',
      status: 'Active',
      isStatic: true
    },
    'DOC-AS-106': {
      id: 'DOC-AS-106',
      name: 'Dr. Arishta Saxena',
      gender: 'Female',
      dob: '',
      phone: '+91 98200 66001',
      email: 'arishta.saxena@medicare.org',
      address: 'F-3, Palm Grove, Chennai',
      emergencyContact: '+91 98200 66002',
      regNumber: 'MCI-2009-99650',
      qualification: 'MS, MCh (Surgical Sciences)',
      specialization: 'Surgeon',
      experience: '16',
      department: 'General Surgery',
      designation: 'Chief Surgeon',
      joiningDate: '2009-07-22',
      fee: '1500',
      loginId: 'DOC-AS-106',
      status: 'Active',
      isStatic: true
    },
    'DOC-KD-107': {
      id: 'DOC-KD-107',
      name: 'Dr. Kavita Desai',
      gender: 'Female',
      dob: '',
      phone: '+91 98200 77001',
      email: 'kavita.desai@medicare.org',
      address: 'G-18, Maple Enclave, Bangalore',
      emergencyContact: '+91 98200 77002',
      regNumber: 'MCI-2017-00760',
      qualification: 'MD (Pediatrics)',
      specialization: 'Pediatrician',
      experience: '8',
      department: 'Pediatrics',
      designation: 'Consultant',
      joiningDate: '2017-02-14',
      fee: '750',
      loginId: 'DOC-KD-107',
      status: 'Active',
      isStatic: true
    }
  };

  /**
   * Retrieves a doctor record by ID.
   * Checks localStorage overrides first, then custom doctors, then static defaults.
   * @param {string} docId
   * @returns {object|null}
   */
  function getDoctorById(docId) {
    if (!docId) return null;

    // 1. Check if there's a saved edit override for a static doctor
    try {
      const staticEdits = JSON.parse(localStorage.getItem('medicare_static_doctor_edits') || '{}');
      if (staticEdits[docId]) return staticEdits[docId];
    } catch (e) {}

    // 2. Check custom doctors (added via add-doctor.html)
    try {
      const customList = JSON.parse(localStorage.getItem('medicare_custom_doctors') || '[]');
      const found = customList.find(d => d.id === docId);
      if (found) return found;
    } catch (e) {}

    // 3. Fall back to static defaults
    if (STATIC_DOCTOR_DEFAULTS[docId]) return Object.assign({}, STATIC_DOCTOR_DEFAULTS[docId]);

    return null;
  }

  /**
   * Saves the updated doctor object back to the correct data store.
   * - Static doctors → stored in medicare_static_doctor_edits (keyed by id)
   * - Custom doctors → updated in-place in medicare_custom_doctors array
   * @param {object} updatedDoctor
   */
  function saveDoctorById(updatedDoctor) {
    const docId = updatedDoctor.id;

    // Check if it's a static doctor
    if (STATIC_DOCTOR_DEFAULTS[docId] || updatedDoctor.isStatic) {
      try {
        const staticEdits = JSON.parse(localStorage.getItem('medicare_static_doctor_edits') || '{}');
        staticEdits[docId] = updatedDoctor;
        localStorage.setItem('medicare_static_doctor_edits', JSON.stringify(staticEdits));
      } catch (e) {
        console.warn('Error saving static doctor edit', e);
      }
      return;
    }

    // It's a custom doctor — update the array in localStorage
    try {
      const customList = JSON.parse(localStorage.getItem('medicare_custom_doctors') || '[]');
      const idx = customList.findIndex(d => d.id === docId);
      if (idx !== -1) {
        customList[idx] = updatedDoctor;
        localStorage.setItem('medicare_custom_doctors', JSON.stringify(customList));
      }
    } catch (e) {
      console.warn('Error saving custom doctor edit', e);
    }
  }

  // ---- Edit Doctor Form Handler (edit-doctor.html) ----
  const editDoctorForm = document.getElementById('editDoctorForm');
  if (editDoctorForm) {

    const formCard = document.getElementById('editDoctorFormCard');
    const successCard = document.getElementById('editDoctorSuccessCard');
    const saveBtn = document.getElementById('saveEditDoctorBtn');
    const alertBox = document.getElementById('editDocAlertBox');
    const alertText = document.getElementById('editDocAlertText');
    const cardTitle = document.getElementById('editDoctorCardTitle');

    // Form field references
    const ef = {
      name:             document.getElementById('editDoctorName'),
      gender:           document.getElementById('editDoctorGender'),
      dob:              document.getElementById('editDoctorDob'),
      phone:            document.getElementById('editDoctorPhone'),
      email:            document.getElementById('editDoctorEmail'),
      address:          document.getElementById('editDoctorAddress'),
      emergencyContact: document.getElementById('editDoctorEmergencyContact'),
      regNumber:        document.getElementById('editDoctorRegNumber'),
      qualification:    document.getElementById('editDoctorQualification'),
      specialization:   document.getElementById('editDoctorSpecialization'),
      experience:       document.getElementById('editDoctorExperience'),
      department:       document.getElementById('editDoctorDepartment'),
      designation:      document.getElementById('editDoctorDesignation'),
      joiningDate:      document.getElementById('editDoctorJoiningDate'),
      fee:              document.getElementById('editDoctorFee'),
      loginId:          document.getElementById('editDoctorLoginId'),
      status:           document.getElementById('editDoctorStatus')
    };

    // Read ?id= from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const currentDocId = urlParams.get('id') || '';

    // Load doctor data into form
    const doctorData = getDoctorById(currentDocId);

    if (!doctorData) {
      // Doctor not found — show error, disable form
      if (alertBox && alertText) {
        alertBox.className = 'auth-alert-box error active';
        alertText.textContent = 'Doctor not found. The doctor ID in the URL is invalid or does not exist. Please go back to the Doctors page.';
      }
      if (saveBtn) saveBtn.disabled = true;
    } else {
      // Populate card title with doctor name
      if (cardTitle) cardTitle.textContent = `Edit: ${doctorData.name || 'Doctor'}`;

      // Helper to set a select's value (create option if not present)
      function setSelectValue(selectEl, value) {
        if (!selectEl || !value) return;
        for (let i = 0; i < selectEl.options.length; i++) {
          if (selectEl.options[i].value === value) {
            selectEl.selectedIndex = i;
            return;
          }
        }
        // Value not in list — add it
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        selectEl.appendChild(opt);
        selectEl.value = value;
      }

      // Populate all form fields with existing data
      if (ef.name)             ef.name.value             = doctorData.name || '';
      setSelectValue(ef.gender, doctorData.gender || 'Male');
      if (ef.dob)              ef.dob.value              = doctorData.dob || '';
      if (ef.phone)            ef.phone.value            = doctorData.phone || '';
      if (ef.email)            ef.email.value            = doctorData.email || '';
      if (ef.address)          ef.address.value          = doctorData.address || '';
      if (ef.emergencyContact) ef.emergencyContact.value = doctorData.emergencyContact || '';
      if (ef.regNumber)        ef.regNumber.value        = doctorData.regNumber || 'N/A';
      if (ef.qualification)    ef.qualification.value    = doctorData.qualification || '';
      setSelectValue(ef.specialization, doctorData.specialization || '');
      if (ef.experience)       ef.experience.value       = doctorData.experience || '';
      setSelectValue(ef.department, doctorData.department || '');
      if (ef.designation)      ef.designation.value      = doctorData.designation || '';
      if (ef.joiningDate)      ef.joiningDate.value      = doctorData.joiningDate || '';
      if (ef.fee)              ef.fee.value              = doctorData.fee || '';
      if (ef.loginId)          ef.loginId.value          = doctorData.loginId || '';
      setSelectValue(ef.status, doctorData.status || 'Active');
    }

    // Validation helpers (same visual pattern as add-doctor)
    function showEditAlert(msg) {
      if (!alertBox || !alertText) return;
      alertBox.className = 'auth-alert-box error active';
      alertText.textContent = msg;
    }
    function hideEditAlert() {
      if (!alertBox) return;
      alertBox.className = 'auth-alert-box';
    }
    function markEditError(input, msg) {
      if (!input) return;
      input.classList.add('is-invalid');
      const err = document.getElementById(input.id + 'Error');
      if (err) { err.textContent = msg; err.classList.add('active'); }
    }
    function clearEditErrors() {
      Object.values(ef).forEach(input => {
        if (input && input.id) {
          input.classList.remove('is-invalid');
          const err = document.getElementById(input.id + 'Error');
          if (err) err.classList.remove('active');
        }
      });
    }

    // Clear error on input
    Object.values(ef).forEach(input => {
      if (input && input.id !== 'editDoctorRegNumber') {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const err = document.getElementById(input.id + 'Error');
          if (err) err.classList.remove('active');
          hideEditAlert();
        });
        input.addEventListener('change', () => {
          input.classList.remove('is-invalid');
          const err = document.getElementById(input.id + 'Error');
          if (err) err.classList.remove('active');
          hideEditAlert();
        });
      }
    });

    // Form submit
    editDoctorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!doctorData) return;

      clearEditErrors();
      hideEditAlert();
      let hasError = false;
      let firstErr = null;

      // 1. Doctor Full Name
      if (!ef.name || !ef.name.value.trim()) {
        markEditError(ef.name, "Please enter the doctor's full name.");
        hasError = true;
        if (!firstErr) firstErr = ef.name;
      }

      // 2. Phone Number
      if (!ef.phone || !ef.phone.value.trim()) {
        markEditError(ef.phone, 'Please enter a valid phone number.');
        hasError = true;
        if (!firstErr) firstErr = ef.phone;
      }

      // 3. Email
      const emailVal = ef.email ? ef.email.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        markEditError(ef.email, 'Please enter an email address.');
        hasError = true;
        if (!firstErr) firstErr = ef.email;
      } else if (!emailRegex.test(emailVal)) {
        markEditError(ef.email, 'Please enter a valid email address.');
        hasError = true;
        if (!firstErr) firstErr = ef.email;
      }

      // 4. Qualification
      if (!ef.qualification || !ef.qualification.value.trim()) {
        markEditError(ef.qualification, 'Please enter the medical qualification.');
        hasError = true;
        if (!firstErr) firstErr = ef.qualification;
      }

      // 5. Specialization
      if (!ef.specialization || !ef.specialization.value.trim()) {
        markEditError(ef.specialization, 'Please select a specialization.');
        hasError = true;
        if (!firstErr) firstErr = ef.specialization;
      }

      // 6. Department
      if (!ef.department || !ef.department.value.trim()) {
        markEditError(ef.department, 'Please select a department.');
        hasError = true;
        if (!firstErr) firstErr = ef.department;
      }

      // 7. Login ID
      if (!ef.loginId || !ef.loginId.value.trim()) {
        markEditError(ef.loginId, 'Please provide a Doctor Login ID.');
        hasError = true;
        if (!firstErr) firstErr = ef.loginId;
      }

      if (hasError) {
        showEditAlert('Please correct the errors in the required fields below.');
        if (firstErr) firstErr.focus();
        return;
      }

      // Loading state
      if (saveBtn) {
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
        const txt = saveBtn.querySelector('.btn-text');
        if (txt) txt.textContent = 'Saving...';
      }

      setTimeout(() => {
        // Build updated doctor object — preserve regNumber and id
        const updatedDoctor = Object.assign({}, doctorData, {
          name:             ef.name.value.trim(),
          gender:           ef.gender ? ef.gender.value : (doctorData.gender || 'Male'),
          dob:              ef.dob ? ef.dob.value : (doctorData.dob || ''),
          phone:            ef.phone.value.trim(),
          email:            ef.email.value.trim(),
          address:          ef.address ? ef.address.value.trim() : (doctorData.address || ''),
          emergencyContact: ef.emergencyContact ? ef.emergencyContact.value.trim() : (doctorData.emergencyContact || ''),
          // regNumber intentionally NOT updated — preserved from doctorData
          qualification:    ef.qualification.value.trim(),
          specialization:   ef.specialization.value,
          experience:       ef.experience ? ef.experience.value.trim() : (doctorData.experience || ''),
          department:       ef.department.value,
          designation:      ef.designation ? ef.designation.value.trim() : (doctorData.designation || ''),
          joiningDate:      ef.joiningDate ? ef.joiningDate.value : (doctorData.joiningDate || ''),
          fee:              ef.fee ? ef.fee.value.trim() : (doctorData.fee || ''),
          loginId:          ef.loginId.value.trim(),
          status:           ef.status ? ef.status.value : (doctorData.status || 'Active'),
          updatedAt:        new Date().toISOString()
        });

        // Save to appropriate data store
        saveDoctorById(updatedDoctor);

        // Populate success card
        const sName = document.getElementById('editSuccessDocName');
        const sSpec = document.getElementById('editSuccessDocSpecialization');
        const sDept = document.getElementById('editSuccessDocDepartment');
        const sReg  = document.getElementById('editSuccessDocRegNumber');
        const sLogin = document.getElementById('editSuccessDocLoginId');

        if (sName)  sName.textContent  = updatedDoctor.name;
        if (sSpec)  sSpec.textContent  = updatedDoctor.specialization;
        if (sDept)  sDept.textContent  = updatedDoctor.department;
        if (sReg)   sReg.textContent   = updatedDoctor.regNumber || 'N/A';
        if (sLogin) sLogin.textContent = updatedDoctor.loginId;

        // Toggle to success view
        if (formCard) formCard.style.display = 'none';
        if (successCard) successCard.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
    });
  }

  // ---- Update renderCustomDoctors to add Edit buttons for custom doctors ----
  // Re-define renderCustomDoctors with Edit button support
  // (overrides the earlier definition safely because it's declared with `function`)
  function renderCustomDoctors() {
    const table = document.getElementById('doctorsMasterTable');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Remove any previously rendered custom doctor rows to avoid duplicates on re-render
    const existing = tbody.querySelectorAll('.custom-doc-row');
    existing.forEach(row => row.remove());

    try {
      const customDoctors = JSON.parse(localStorage.getItem('medicare_custom_doctors') || '[]');
      if (customDoctors.length === 0) return;

      customDoctors.forEach(doc => {
        const tr = document.createElement('tr');
        tr.className = 'custom-doc-row';
        if (doc.id) tr.setAttribute('data-doc-id', doc.id);

        const cleanName = (doc.name || 'Dr.').replace(/^(Dr\.|Dr)\s*/i, '').trim();
        const parts = cleanName.split(' ');
        const initials = parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : (cleanName.substring(0, 2)).toUpperCase();

        const editLink = doc.id
          ? `<a href="edit-doctor.html?id=${encodeURIComponent(doc.id)}" class="edit-doc-btn" aria-label="Edit ${escapeHtml(doc.name)}">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
               <span>Edit</span>
             </a>`
          : '';

        tr.innerHTML = `
          <td>
            <div class="patient-cell">
              <div class="user-avatar-sm" style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); color: var(--primary); font-weight: 700;">${initials}</div>
              <div class="user-cell-meta">
                <span class="cell-primary-text">${escapeHtml(doc.name)}</span>
                <span class="cell-sub-text">${escapeHtml(doc.qualification || 'Medical Faculty')} • Reg: ${escapeHtml(doc.regNumber || 'N/A')}</span>
              </div>
            </div>
          </td>
          <td><span class="dept-tag">${escapeHtml(doc.department || doc.specialization || 'General')}</span></td>
          <td>${escapeHtml(doc.joiningDate ? 'Joined: ' + doc.joiningDate : '09:00 AM - 02:00 PM')}</td>
          <td><span class="room-pill">Consultation</span></td>
          <td><span class="doc-status-pill available">Active</span></td>
          <td>${editLink}</td>
        `;
        tbody.insertBefore(tr, tbody.firstChild);
      });
    } catch (err) {
      console.warn('Error loading custom doctors', err);
    }
  }

  // Re-render custom doctors table now (with edit buttons)
  if (document.getElementById('doctorsMasterTable')) {
    renderCustomDoctors();
  }

});
