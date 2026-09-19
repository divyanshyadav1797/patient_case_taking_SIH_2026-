# MediCare - Doctor Dashboard

A modern, professional, responsive Doctor Dashboard web application built for the **MediCare** healthcare management system.

Built strictly using **HTML5, CSS3, and vanilla JavaScript** without any external UI frameworks (No React, No Tailwind). Clean, beginner-friendly, and ready to open immediately in VS Code.

---

## 1. Project Structure

```text
SIH ANTIGRAVITY/
├── index.html       # Semantic HTML5 dashboard markup with responsive layout & accessible SVGs
├── styles.css       # Clean CSS3 design system, healthcare color tokens, and responsive queries
├── app.js           # Interactive vanilla JS (live patient search, active tabs, toast alerts)
└── README.md        # Documentation, customization guide, and backend integration instructions
```

---

## 2. How to Run in VS Code

You can run this project in either of two quick ways:

### Option A: Direct Browser Launch (Easiest)
1. Open the project folder in **VS Code**.
2. Right-click `index.html` in the file explorer.
3. Select **"Open with Default Browser"** or **"Reveal in File Explorer"** and double-click `index.html`.

### Option B: VS Code Live Server Extension (Recommended for Live Reload)
1. In VS Code, install the **Live Server** extension by Ritwick Dey (if not already installed).
2. Right-click `index.html` and click **"Open with Live Server"**.
3. Your browser will automatically open `http://127.0.0.1:5500/index.html`.

---

## 3. Where to Change Patient Data

All patient and appointment data is cleanly isolated in **`app.js`** around line 50.

Look for the `APPOINTMENTS_DATA` array:

```javascript
// In app.js
const APPOINTMENTS_DATA = [
  {
    id: 1,
    time: "09:00 AM",
    patient: "Rahul Mehta",
    initials: "RM",
    avatarClass: "avatar-rm",
    type: "General Consultation",
    status: "Completed" // Use "Completed" or "Upcoming"
  },
  // Add new patients here...
];
```

To add a new appointment, simply add a new object to this array with `time`, `patient`, `initials`, `type`, and `status`.

---

## 4. Where to Change Doctor Information

Doctor details (name, specialty, initials, greetings) can be edited in two locations:

### 1. In `app.js` (Lines 26–34)
```javascript
const DOCTOR_DATA = {
  name: "Dr. Sharma",
  specialty: "General Physician",
  initials: "DS",
  greeting: "Good morning, Dr. Sharma",
  subtitle: "Here's your practice overview for today."
};
```

### 2. In `index.html` (Header Section)
You can directly update the static text in `index.html`:
- Doctor Greeting: `<h1 class="doctor-greeting">Good morning, Dr. Sharma</h1>`
- Doctor Avatar Initials: `<span id="doctorInitials">DS</span>`
- Doctor Name: `<span class="doctor-name">Dr. Sharma</span>`
- Specialty: `<span class="doctor-specialty">General Physician</span>`

---

## 5. Where to Connect Backend API / Database

At the bottom of **`app.js`** (Section 7), there is a pre-configured template for connecting to a backend REST API (Node.js/Express, Python/Django/Flask, PHP, or Firebase):

```javascript
async function fetchAppointmentsFromBackend() {
  try {
    const response = await fetch('http://localhost:5000/api/doctor/appointments');
    const data = await response.json();
    
    // Automatically renders the appointments returned by your backend API:
    renderAppointments(data);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    showToast('Failed to load appointments from server', 'warning');
  }
}

// Call fetchAppointmentsFromBackend() on page load instead of static data
```

---

## 6. Key Features Included

- **Clinical Healthcare Color Palette**: Primary Deep Medical Blue `#2563EB`, Secondary Soft Blue `#DBEAFE`, Page Background `#F8FAFC`, Cards `#FFFFFF`, Main Navy Text `#172033`, Secondary Gray Text `#64748B`, Health Success `#16A34A`, Warning Amber `#F59E0B`, and Emergency Red `#DC2626`.
- **Fixed Sidebar**: MediCare branding with medical "+" icon, active indicators, and Help & Support footer.
- **Interactive Search**: Real-time patient & appointment filtering by name, consultation type, time, or status.
- **Today's At A Glance**: 3 statistics cards (Total Patients, Today's Appointments, Follow-ups) evenly distributed with custom healthcare icons.
- **Appointments Schedule**: Initials avatars (`RM`, `PS`, `AV`, `NS`) and distinct "Completed" (`#16A34A`) vs "Upcoming" (`#2563EB`) status pills.
- **Recent Activity & Needs Attention**: Structured clinical documentation alerts and chronological patient timeline.
- **Fully Responsive**: Adapts seamlessly from 1440px desktop screens down to tablets and mobile devices with a slide-out drawer menu.
