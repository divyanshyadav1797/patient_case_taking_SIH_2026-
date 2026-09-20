import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';

export default function PatientSchemes() {
  const navigate = useNavigate();
  const { schemes, showToast, bookAppointment } = usePatient();
  const [activeSchemeKey, setActiveSchemeKey] = useState('RGHS');
  const [schemeTab, setSchemeTab] = useState('hospitals'); // 'hospitals' | 'scheme-doctors' | 'benefits' | 'facilities'
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  const schemeList = [
    { key: 'RGHS', tag: 'Rajasthan', name: 'RGHS', title: 'Rajasthan Government Health Scheme', icon: 'fa-building-columns', class: 'rghs' },
    { key: 'ECHS', tag: 'Ex-Servicemen', name: 'ECHS', title: 'Ex-Servicemen Contributory Health Scheme', icon: 'fa-user-shield', class: 'echs' },
    { key: 'CGHS', tag: 'Central Government', name: 'CGHS', title: 'Central Government Health Scheme', icon: 'fa-landmark', class: 'cghs' },
    { key: 'MAA-Y', tag: 'Rajasthan', name: 'MAA-Y', title: 'Mukhyamantri Ayushman Arogya Yojana', icon: 'fa-heart', class: 'maay' },
    { key: 'Bhamashah', tag: 'Historical / Legacy', name: 'Bhamashah', title: 'Bhamashah Swasthya Bima Yojana', icon: 'fa-clock-rotate-left', class: 'bhamashah' }
  ];

  const empaneledHospitals = [
    { name: 'SMS Government Medical College & Hospital', location: 'Jaipur', specialty: 'Multi-Specialty & Trauma', beds: '2,500 Beds', rating: '4.8', contact: '0141-2560291' },
    { name: 'Fortis Escorts Hospital', location: 'Jaipur', specialty: 'Cardiology & Oncology', beds: '350 Beds', rating: '4.7', contact: '0141-2547000' },
    { name: 'AIIMS Jodhpur', location: 'Jodhpur', specialty: 'Super Specialty Tertiary Care', beds: '960 Beds', rating: '4.9', contact: '0291-2740741' },
    { name: 'Geetanjali Medical College & Hospital', location: 'Udaipur', specialty: 'Multi-Specialty & Organ Transplant', beds: '1,150 Beds', rating: '4.6', contact: '0294-2500000' }
  ];

  const schemeDoctors = [
    { name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', hospital: 'SMS Hospital, Jaipur', room: 'OPD Chamber 14', slot: 'Mon - Fri (09:00 - 13:00)' },
    { name: 'Dr. Rajesh Gupta', specialty: 'Orthopedics', hospital: 'SMS Hospital, Jaipur', room: 'OPD Chamber 08', slot: 'Mon - Sat (10:00 - 14:00)' },
    { name: 'Dr. Priya Patel', specialty: 'General Medicine', hospital: 'Apollo Clinic Jaipur', room: 'Room 04', slot: 'Daily (08:30 - 16:00)' }
  ];

  const filteredHospitals = empaneledHospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) || h.specialty.toLowerCase().includes(hospitalSearch.toLowerCase());
    const matchesLoc = locationFilter === 'all' || h.location.toLowerCase() === locationFilter.toLowerCase();
    return matchesSearch && matchesLoc;
  });

  return (
    <div className="page active-page" id="schemes">
      <div className="page-header">
        <h1>Government Health Schemes</h1>
        <p>Find hospitals, doctors, and cashless benefits available through state & national healthcare schemes.</p>
      </div>

      {/* Quick Status Banner */}
      <div className="scheme-status-banner">
        <div className="scheme-status-icon">
          <i className="fa-solid fa-shield-heart"></i>
        </div>
        <div>
          <strong>Your registered scheme</strong>
          <span>RGHS (Rajasthan Government Health Scheme)</span>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={() => navigate('/patient/my-scheme')}
        >
          View My Scheme
        </button>
      </div>

      {/* Scheme Cards Selection */}
      <h2 className="subsection-title" style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.25rem', color: '#172033' }}>
        Choose a Health Scheme
      </h2>

      <div className="scheme-grid">
        {schemeList.map((item) => (
          <div
            key={item.key}
            className={`scheme-card-item ${activeSchemeKey === item.key ? 'active-scheme' : ''}`}
            onClick={() => {
              setActiveSchemeKey(item.key);
              showToast(`Selected scheme: ${item.name}`);
            }}
          >
            <div className={`scheme-icon ${item.class}`}>
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <span className="scheme-tag">{item.tag}</span>
            <h3>{item.name}</h3>
            <p>{item.title}</p>
            <div className="scheme-actions">
              <button type="button">View Scheme</button>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Detail Panel */}
      <div className="scheme-detail" id="schemeDetail" style={{ marginTop: '2.5rem' }}>
        <div className="scheme-detail-header">
          <div>
            <span className="small-label">Selected Scheme</span>
            <h2 id="selectedSchemeName">{activeSchemeKey}</h2>
            <p id="selectedSchemeDescription">
              {schemeList.find(s => s.key === activeSchemeKey)?.title || 'Comprehensive Healthcare Scheme'}
            </p>
          </div>
          <span className="active-pill" id="schemeActiveStatus">● Active Beneficiary Portal</span>
        </div>

        {/* Scheme Navigation Tabs */}
        <div className="scheme-tabs">
          <button
            type="button"
            className={`scheme-tab ${schemeTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => setSchemeTab('hospitals')}
          >
            <i className="fa-solid fa-hospital"></i> Hospitals
          </button>
          <button
            type="button"
            className={`scheme-tab ${schemeTab === 'scheme-doctors' ? 'active' : ''}`}
            onClick={() => setSchemeTab('scheme-doctors')}
          >
            <i className="fa-solid fa-user-doctor"></i> Doctors
          </button>
          <button
            type="button"
            className={`scheme-tab ${schemeTab === 'benefits' ? 'active' : ''}`}
            onClick={() => setSchemeTab('benefits')}
          >
            <i className="fa-solid fa-star"></i> Benefits
          </button>
          <button
            type="button"
            className={`scheme-tab ${schemeTab === 'facilities' ? 'active' : ''}`}
            onClick={() => setSchemeTab('facilities')}
          >
            <i className="fa-solid fa-pills"></i> Facilities
          </button>
        </div>

        {/* Tab 1: Hospitals */}
        {schemeTab === 'hospitals' && (
          <div className="scheme-tab-content active" id="hospitals">
            <div className="filter-row">
              <div className="filter-input">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search hospital or specialty..."
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                />
              </div>

              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="all">All Locations</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Jodhpur">Jodhpur</option>
                <option value="Udaipur">Udaipur</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
              {filteredHospitals.map((h, i) => (
                <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.25rem', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#172033' }}>{h.name}</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#DCFCE7', color: '#16A34A', borderRadius: '9999px', fontWeight: 600 }}>
                      Empaneled
                    </span>
                  </div>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#64748B' }}>
                    📍 {h.location} · {h.specialty} ({h.beds})
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>📞 {h.contact}</span>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        bookAppointment(`Dr. Duty Officer (${h.name})`, h.name, 'Sep 24, 2026', '11:30 AM');
                      }}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Book OPD
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Doctors */}
        {schemeTab === 'scheme-doctors' && (
          <div className="scheme-tab-content active" id="scheme-doctors">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
              {schemeDoctors.map((doc, idx) => (
                <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.25rem', background: '#FFFFFF' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#172033' }}>{doc.name}</h4>
                  <p style={{ margin: '0.35rem 0', fontSize: '0.85rem', color: '#2563EB', fontWeight: 600 }}>{doc.specialty}</p>
                  <p style={{ margin: '0.35rem 0', fontSize: '0.8rem', color: '#64748B' }}>🏥 {doc.hospital} · {doc.room}</p>
                  <p style={{ margin: '0.35rem 0', fontSize: '0.8rem', color: '#16A34A' }}>⏱ {doc.slot}</p>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => bookAppointment(doc.name, doc.hospital, 'Sep 25, 2026', '10:15 AM')}
                    style={{ marginTop: '0.75rem', width: '100%', padding: '0.45rem', fontSize: '0.85rem' }}
                  >
                    Book Scheme Consultation
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Benefits */}
        {schemeTab === 'benefits' && (
          <div className="scheme-tab-content active" id="benefits">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
              {(schemes[activeSchemeKey]?.benefits || schemes.RGHS.benefits).map((b, i) => (
                <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.25rem', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '1.5rem', color: '#2563EB', marginBottom: '0.5rem' }}>
                    <i className={`fa-solid ${b.icon}`}></i>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#172033' }}>{b.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Facilities */}
        {schemeTab === 'facilities' && (
          <div className="scheme-tab-content active" id="facilities">
            <div style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #E2E8F0', marginTop: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', color: '#172033' }}>Authorized Diagnostics & Drug Stores</h3>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: 2, color: '#475569', fontSize: '0.9rem' }}>
                <li><strong>Co-operative Drug Stores (CONFED):</strong> 100% free generic medicines upon presenting e-prescriptions.</li>
                <li><strong>NABL Accredited Diagnostics:</strong> Free biochemistry, hematology, and CT/MRI imaging with digital reporting.</li>
                <li><strong>Daycare Surgical Procedures:</strong> Cashless coverage for dialysis, chemotherapy, cataract surgery, and endoscopy.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
