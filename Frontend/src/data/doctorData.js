// Doctor Default Identity
export const DOCTOR_DATA = {
  name: "Dr. Sarah Jenkins",
  specialty: "Chief Cardiologist",
  initials: "SJ",
  greeting: "Good morning, Dr. Jenkins",
  subtitle: "Here's your clinical practice overview for today."
};

// Initial Practice Stats Overview (Synchronized dynamically with MongoDB)
export const STATS_DATA = {
  totalPatients: { value: "0", meta: "Registered in database" },
  todayAppointments: { value: "0", meta: "Scheduled today" },
  followUps: { value: "0", meta: "Active prescriptions" }
};

// Clean Data Stores (Filled dynamically by live API from MongoDB)
export const PATIENTS_DATA = [];
export const INITIAL_APPOINTMENTS = [];
export const INITIAL_PRESCRIPTIONS = [];
export const RECORDS_DATA = [];
export const INITIAL_CHATS = [];
