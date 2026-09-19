import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';

export default function PatientDoctors() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const { doctors, bookAppointment, showToast } = usePatient();

  const specialties = [
    { label: 'All', icon: '🩺' },
    { label: 'Cardiology', icon: '❤️' },
    { label: 'Dentistry', icon: '🦷' },
    { label: 'Ophthalmology', icon: '👁️' },
    { label: 'Orthopedic', icon: '🦴' },
    { label: 'Neurology', icon: '🧠' }
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="page active-page" id="doctors">
      <div className="page-header">
        <h1>Find a Doctor</h1>
        <p>Find the right doctor for your healthcare needs.</p>
      </div>

      <div className="doctor-search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          id="doctorSearch"
          placeholder="Search doctor or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="specialties">
        {specialties.map((item) => (
          <button
            key={item.label}
            type="button"
            className={selectedSpecialty === item.label ? 'active' : ''}
            onClick={() => {
              setSelectedSpecialty(item.label);
              showToast(`Filtered by ${item.label}`);
            }}
            style={selectedSpecialty === item.label ? { background: '#2563EB', color: '#fff' } : {}}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <div className="doctor-list" id="doctorList">
        {filteredDoctors.map((doc) => (
          <div className="doctor-card" key={doc.id}>
            <div className="doctor-avatar large">
              {doc.name.split(' ').map(n => n[0]).slice(1, 3).join('') || 'DR'}
            </div>

            <div className="doctor-details">
              <h3>{doc.name}</h3>
              <p>{doc.specialty} · {doc.experience}</p>
              <div className="rating">
                ⭐ {doc.rating} <span>({doc.reviews} reviews)</span>
              </div>
              <p>
                <i className="fa-solid fa-location-dot"></i> SMS Hospital / MediCare Center
              </p>
            </div>

            <div className="doctor-actions">
              <span className="available">● {doc.available}</span>
              <button
                type="button"
                className="primary-btn"
                onClick={() => bookAppointment(doc.name, 'SMS Hospital', 'Sep 23, 2026', '10:00 AM')}
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            <p>No specialists found matching "{search}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
