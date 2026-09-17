import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';

const FAQS = [
  {
    id: 1,
    q: 'How do I search or view a patient?',
    a: 'To inspect patient details, navigate to the Patients page and use the search bar or click "View Profile" next to any patient to review their complete clinical case history, vitals, prescriptions, and medical records.'
  },
  {
    id: 2,
    q: 'How do I view medical records?',
    a: 'Click Medical Records in the left sidebar navigation to view a searchable repository of patient diagnostic reports, lab findings, and scans. You can preview documents directly by clicking the "View" button or download them for offline reference.'
  },
  {
    id: 3,
    q: 'How do I create a prescription?',
    a: 'Go to the Prescriptions section and click "Create Prescription". Select the patient from the dropdown list, enter the medication details (Dosage, Frequency, Duration, Special instructions), and click "Save Prescription" to record it.'
  },
  {
    id: 4,
    q: 'How do I manage appointments?',
    a: 'Open the Appointments page. Here you can filter consultations by date or status (Today, Upcoming, Completed). You can reschedule a consultation to a new date and time or cancel an appointment with automated status updates.'
  }
];

export default function HelpPage() {
  const { setIsSupportModalOpen } = useDoctor();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState([1]);

  const toggleFaq = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="viewHelp" className="page-view active" role="region" aria-label="Help & Support View">
      <div className="help-hero">
        <h2>How can we help you today?</h2>
        <p>Search guides, clinical documentation, or reach our technical support team.</p>
        <div className="help-search-container">
          <input
            type="text"
            id="helpSearchInput"
            className="form-control"
            style={{ height: '46px', borderRadius: 'var(--radius-full)', padding: '0 24px' }}
            placeholder="Type your question or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '16px' }}>
          Frequently Asked Questions
        </h3>
      </div>

      <div className="faq-accordion-list" id="faqAccordion">
        {filteredFaqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div key={faq.id} className={`faq-card ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleFaq(faq.id)}
              >
                <span>{faq.q}</span>
                <span className="faq-icon" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="contact-support-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
          Still need assistance?
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Our clinical IT desk is available 24/7 to assist with portal operations.
        </p>
        <button
          type="button"
          className="btn-primary"
          id="openContactSupportBtn"
          onClick={() => setIsSupportModalOpen(true)}
        >
          Contact Support
        </button>
      </div>
    </section>
  );
}
