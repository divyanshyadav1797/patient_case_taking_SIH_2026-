Quantum Care

<p align="center">
  <strong>AI-Powered Digital Health Profile & Clinical Intake Platform</strong>
</p>

<p align="center">
  <em>Collect the patient's story before the consultation. Organize the records. Give the doctor the context.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-prototype-blueviolet" alt="Status: Prototype">
  <img src="https://img.shields.io/badge/frontend-React-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/backend-Node.js-339933" alt="Node.js">
  <img src="https://img.shields.io/badge/API-Express-000000" alt="Express">
  <img src="https://img.shields.io/badge/database-MongoDB-47A248" alt="MongoDB">
  <img src="https://img.shields.io/badge/AI-OpenAI-black" alt="OpenAI">
  <img src="https://img.shields.io/badge/license-Educational%20Prototype-lightgrey" alt="License">
</p>

Overview

Quantum Care is a web-first healthcare platform designed to reduce the amount of routine history-taking and medical-record searching that happens during a doctor's limited consultation time.

The platform gives a patient a persistent digital health profile where they can:

Register and authenticate using an Aadhaar-based identity flow with OTP verification.

Complete their health profile.

Describe what they are currently suffering from using voice, text, or touch selections.

Answer adaptive AI-generated questions.

Generate a structured Digital Clinical Report.

Upload previous prescriptions, lab reports, discharge summaries, scans, and other medical documents.

OCR and structure information from uploaded records.

Build a chronological medical timeline.

Find hospitals/departments and book appointments.

Receive an appointment QR code.

The same React application also provides a dedicated Kiosk Mode for hospital use. The kiosk and patient website share the same backend, database, clinical logic, and design system.

The long-term vision is to create a patient-controlled, longitudinal health record that can be securely shared with authorized healthcare providers, with future support for ABDM/FHIR and hospital-system interoperability.

Quantum Care is a clinical support and information-intake platform, not an autonomous doctor. Final diagnosis and treatment remain the responsibility of a qualified healthcare professional.

Why Quantum Care?

Traditional OPD workflow often forces doctors to spend valuable consultation time on:

Asking the same history questions
        +
Reading scattered paper reports
        +
Reconstructing previous medical events
        +
Manually organizing information

Quantum Care moves much of that information work earlier:

Patient
   |
   v
Digital Health Profile
   |
   v
Voice / Touch Clinical Intake
   |
   v
Document OCR + Extraction
   |
   v
Medical Timeline
   |
   v
Digital Clinical Report
   |
   v
Doctor Review
   |
   v
Consultation

The objective is not to replace the doctor. It is to make the information the doctor needs available before the consultation begins.

Core Features

Patient Web Application

Aadhaar number + OTP registration flow

Password/PIN-based login

Patient profile

Personal and medical information

Current health problem intake

Voice interaction

Text input

Touch/selection input

Adaptive AI questioning

Multilingual UI foundation

Audio interaction

Digital clinical report

Medical document upload

OCR processing

AI-assisted medical information extraction

Medical timeline

Hospital and department discovery

Doctor and slot selection

Appointment booking

Appointment QR generation

Consent and data-sharing controls

Hospital Kiosk Mode

The kiosk is not a separate frontend. It is the same React application running in a dedicated kiosk layout.

Kiosk capabilities include:

Hospital-side authentication

Patient lookup

New patient registration

Patient profile retrieval

Appointment lookup

Appointment creation

Check-in workflow

Clinical intake

Voice + touch interaction

Document upload/scanning workflow

Digital report completion

Session termination and cleanup

Clinical Intelligence

Natural-language symptom understanding

Adaptive follow-up questions

Structured clinical history

Clinical summary generation

Document OCR

Medical entity extraction

Source/provenance tracking

Rule-based red-flag detection

Physician-verification workflow

Product Architecture

                         QUANTUM CARE
                              |
               +--------------+--------------+
               |                             |
               v                             v
        PATIENT WEBSITE                 KIOSK MODE
               |                             |
               +--------------+--------------+
                              |
                              v
                       REACT APPLICATION
                              |
                              v
                         REST API
                              |
                              v
                    NODE.JS + EXPRESS
                              |
            +-----------------+-----------------+
            |                 |                 |
            v                 v                 v
      AUTH SERVICE      CLINICAL SERVICE   APPOINTMENT SERVICE
            |                 |                 |
            +-----------------+-----------------+
                              |
            +-----------------+-----------------+
            |                                   |
            v                                   v
         MongoDB                         External AI APIs
            |                                   |
            |                         +---------+---------+
            |                         |                   |
            v                         v                   v
    Patient / Clinical            OpenAI             Speech / TTS
    Data / Documents

               Document Processing
                        |
                        v
                   Tesseract.js

               Prototype File Storage
                        |
                        v
                 Local Filesystem

Technology Stack

Area

Technology

Frontend

React.js + Vite + JavaScript

Styling

Tailwind CSS + shadcn/ui

UI / Motion

React Bits, Aceternity UI, Magic UI, Motion/Animate, Hover.dev where appropriate

Icons

Lucide React

Routing

React Router

Server State

TanStack Query

Client State

Zustand

Forms

React Hook Form + Zod

Backend

Node.js + Express.js

Database

MongoDB + Mongoose

AI

External OpenAI APIs

Speech-to-Text

External OpenAI speech API

Text-to-Speech

External OpenAI TTS

OCR

Tesseract.js

Maps

OpenStreetMap + Leaflet

QR

qrcode

Authentication

Aadhaar + OTP + password/PIN architecture

Storage

Local filesystem for prototype

Testing

Vitest, React Testing Library, Supertest, Playwright

Development

Git, GitHub, VS Code, npm

Intentionally deferred

The current prototype does not require:

Payment gateway

Cloud file storage

Cloud database

Production ABDM integration

Production HIS/EMR integration

Physical kiosk hardware

Biometric authentication

Local LLMs / Ollama / local Whisper / local TTS models

Authentication Flow

Patient Registration

Aadhaar Number
      |
      v
Mobile / registered contact verification
      |
      v
OTP
      |
      v
OTP Verified
      |
      v
Create Password / PIN
      |
      v
Patient Profile
      |
      v
Logged In

Patient Login

Aadhaar Number + Password/PIN
              |
              v
         Authentication
              |
              v
       Patient Dashboard

For the prototype, the Aadhaar/OTP integration should be abstracted behind provider interfaces. A mock/development verification provider can be used until an authorized production Aadhaar integration is available.

Patient Journey

Register / Login
      |
      v
Complete Profile
      |
      v
"What are you suffering from?"
      |
      +----------+-----------+
      |          |           |
     Voice      Text       Touch
      |          |           |
      +----------+-----------+
                 |
                 v
        Adaptive AI Questions
                 |
                 v
       Digital Clinical Report
                 |
                 v
         Upload Medical Records
                 |
                 v
             OCR + AI
                 |
                 v
          Medical Timeline
                 |
                 v
        Hospital / Department
             Recommendation
                 |
                 v
          Book Appointment
                 |
                 v
          Appointment QR

Kiosk Journey

Open /kiosk
     |
     v
Hospital / Kiosk Authentication
     |
     v
Identify Patient
     |
     +----------+----------+
     |                     |
 Existing Patient       New Patient
     |                     |
     +----------+----------+
                |
                v
       Patient Profile
                |
                v
 Appointment / Check-in / Intake
                |
                v
       Voice + Touch Flow
                |
                v
       Update Current Health
                |
                v
      Process New Documents
                |
                v
        Final Clinical Report
                |
                v
        Mark Ready / Complete
                |
                v
       Terminate Kiosk Session
                |
                v
          Clean Kiosk Screen

AI Clinical Workflow

The AI layer is intentionally controlled by application logic rather than being allowed to improvise the entire clinical workflow.

Chief Complaint
      |
      v
Clinical Section
      |
      v
Required Fields
      |
      v
AI Generates Natural Question
      |
      v
Patient Answers
      |
      v
Answer Structured
      |
      v
Clinical Rules Updated
      |
      +-------> Red Flag Rules
      |
      v
Next Missing Field
      |
      v
Next Question

The backend owns the session state, questionnaire sections, completion rules, and red-flag logic. The AI is responsible for natural-language understanding, question wording, structuring, and summarization.

Medical Document Pipeline

Upload Document
      |
      v
File Validation
      |
      v
Local Storage
      |
      v
Tesseract.js OCR
      |
      v
OCR Text
      |
      v
AI Clinical Extraction
      |
      +-------> Diagnoses
      +-------> Medicines
      +-------> Dosages
      +-------> Lab Values
      +-------> Procedures
      +-------> Dates
      |
      v
Structured Extraction
      |
      v
Medical Timeline Event

The original uploaded file is preserved. OCR and AI extraction are stored separately so a doctor can always compare extracted information with the source document.

Doctor Data Model

Even though the first prototype is focused on patient and kiosk experiences, the backend is structured around physician-ready information.

A future doctor interface will consume:

Patient Profile
      +
Current Complaint
      +
Structured Clinical History
      +
Previous Medical History
      +
Medical Timeline
      +
Uploaded Documents
      +
OCR / Extracted Information
      +
Red Flag Status
      |
      v
Digital Clinical Report

The AI-generated report remains a draft until a doctor verifies it.

Backend Structure

server/
├── src/
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── providers/
│   ├── schemas/
│   ├── middleware/
│   ├── utils/
│   └── app.js
│
├── storage/
│   ├── documents/
│   └── temporary/
│
└── tests/

Layer responsibilities

Layer

Responsibility

Routes

Endpoint definitions

Controllers

Request/response handling

Services

Business logic and workflows

Repositories

MongoDB operations

Models

Mongoose schemas

Providers

External services

Schemas

Request/response validation

Middleware

Auth, roles, rate limits, errors, audit

Utils

Shared utilities

The rule is simple: controllers coordinate, services decide, repositories store, providers integrate.

Repository Structure

quantum-care/
│
├── client/
│   └── src/
│       ├── components/
│       ├── features/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── stores/
│       ├── schemas/
│       ├── i18n/
│       └── utils/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── providers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── storage/
│   └── tests/
│
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   └── backend-architecture.md
│
├── .env.example
├── package.json
└── README.md

Core API Areas

Base URL:

/api/v1

Authentication

POST /auth/register/request-otp
POST /auth/register/verify-otp
POST /auth/register/complete
POST /auth/login
POST /auth/logout
GET  /auth/me

Patient

GET   /patients/me
PATCH /patients/me
GET   /patients/me/history
PATCH /patients/me/history
GET   /patients/me/timeline
GET   /patients/me/documents
GET   /patients/me/appointments

Clinical

POST /clinical-sessions
GET  /clinical-sessions/:id
POST /clinical-sessions/:id/message
POST /clinical-sessions/:id/answer
POST /clinical-sessions/:id/complete
GET  /clinical-sessions/:id/report

Documents

POST   /documents
GET    /documents
GET    /documents/:id
GET    /documents/:id/file
POST   /documents/:id/process
GET    /documents/:id/extraction
PATCH  /documents/:id/verify
DELETE /documents/:id

Appointments

GET  /appointments/slots
POST /appointments
GET  /appointments/:id
POST /appointments/:id/cancel
POST /appointments/:id/reschedule
POST /appointments/:id/check-in
GET  /appointments/:id/qr

Kiosk

POST /kiosk/login
GET  /kiosk/session
POST /kiosk/patient/search
POST /kiosk/patient/check-in
POST /kiosk/appointments
POST /kiosk/clinical-session
POST /kiosk/session/end

MongoDB Collections

The prototype uses these main collections:

users
patients
doctors
hospitals
departments
appointments
visits
clinical_sessions
clinical_answers
clinical_reports
documents
document_extractions
medical_events
medications
allergies
consents
data_shares
notifications
audit_logs

Important separation

User        = authentication identity
Patient     = persistent health profile
Appointment = scheduled interaction
Visit       = actual clinical encounter
Document    = original medical source
Report      = structured clinical summary
Event       = timeline item
Session     = temporary/intake workflow

This separation is important for maintaining a longitudinal patient history.

Design System

Quantum Care uses a clean healthcare aesthetic with:

Minimalism

Glassmorphism

Blur morphism

Soft Material Design principles

Responsive layouts

Controlled animation

Large patient-facing controls

Dense but clear clinical dashboards

Light theme

Light Pink
Light Orange
Light Blue
White
Soft Lavender accents

Dark theme

Dark Grey
Black
Dark Purple
Light Purple
Soft Violet accents

AI-related UI elements use subtle purple/lavender accents. Clinical alerts use semantic warning/critical colors rather than decorative color choices.

Accessibility

The patient experience is designed for:

Elderly users

Low-literacy users

First-time digital users

Multilingual users

Voice-first users

Touch-first users

Every major question should support an appropriate combination of:

Voice
Text
Touch selection
Audio guidance

Large controls, high contrast, clear focus states, reduced-motion support, and readable typography are required.

Safety & Clinical Boundaries

Quantum Care must not behave like an autonomous doctor.

The AI must not:

invent patient information,

silently fill missing facts,

present an AI inference as a confirmed diagnosis,

prescribe independently,

alter verified doctor records,

hide uncertainty.

The system may:

structure patient responses,

ask follow-up questions,

summarize information,

extract information from records,

apply predefined red-flag rules.

The doctor remains responsible for clinical decision-making.

Prototype Development Priorities

Phase 1 — Foundation

React + Vite setup

Express API

MongoDB connection

Authentication

Design system

Role/session handling

Phase 2 — Patient Experience

Registration

Login

Profile

Clinical intake

Voice/text/touch

AI questioning

Clinical report

Phase 3 — Medical Records

Upload

Local storage

OCR

AI extraction

Timeline

Phase 4 — Appointment

Hospital data

Departments

Doctors

Slots

Booking

QR generation

Phase 5 — Kiosk Mode

Kiosk authentication

Patient lookup

Check-in

Appointment creation

Intake

Document workflow

Session cleanup

Phase 6 — Polish

Accessibility

Error recovery

Performance

Testing

Animations

Responsive behavior

Prototype Limitations

The current prototype intentionally does not include:

Payment gateway

Cloud storage

Production Aadhaar verification

Production SMS infrastructure

ABDM production connectivity

HIS/EMR integrations

Physical kiosk hardware

Biometric verification

These are future extensions, not missing pieces of the current prototype.

Future Roadmap

Current
  |
  +--> Web Patient Experience
  +--> Kiosk Mode
  +--> AI Clinical Intake
  +--> OCR + Medical Timeline
  +--> Appointment Workflow
  |
  v
Next
  |
  +--> Payment Gateway
  +--> Cloud Storage
  +--> Production OTP
  +--> Production Aadhaar Provider
  +--> Doctor Dashboard Expansion
  |
  v
Future
  |
  +--> ABDM / ABHA Integration
  +--> FHIR Interoperability
  +--> HIS / EMR Integration
  +--> Physical Kiosk Hardware
  +--> More Indian Languages
  +--> Cross-Hospital Record Sharing

Getting Started

Prerequisites

Install:

Node.js

npm

MongoDB Community Server

Git

VS Code or another editor

You also need an OpenAI API key for AI/speech features.

Clone

git clone <your-repository-url>
cd quantum-care

Install dependencies

npm install

If client/server are separate packages:

cd client
npm install

cd ../server
npm install

Environment

Create .env from .env.example.

Example:

NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/quantumcare

OPENAI_API_KEY=your_key_here
OPENAI_MODEL=your_model

OTP_PROVIDER=mock
AADHAAR_PROVIDER=mock

STORAGE_PROVIDER=local
UPLOAD_DIRECTORY=./storage/documents

CLIENT_URL=http://localhost:5173

Run

Frontend:

npm run client

Backend:

npm run server

Or use:

npm run dev

Development Principles

Keep the backend modular, but do not over-engineer it into unnecessary microservices.

Keep clinical business logic on the server.

Validate every request on the backend.

Never trust frontend payment/authentication state.

Never expose secrets in React code.

Keep original documents separate from extracted information.

Preserve data provenance.

Keep the kiosk on the same backend and database.

Keep third-party integrations behind provider modules.

Make failure recoverable wherever possible.

Project Status

Current status: Prototype / Active Development

The present goal is to complete the website and shared kiosk-mode interface before introducing production infrastructure, payment processing, cloud storage, or national health interoperability.

Vision

Quantum Care is built around a simple idea:

The doctor should receive the patient's story before spending the consultation discovering it.

The platform prepares that story through conversational intake, structured history, document intelligence, and a persistent medical timeline, while keeping the final clinical decision firmly with the healthcare professional.

<p align="center">
  <strong>Quantum Care</strong><br>
  <em>Prepare the information. Preserve the history. Improve the consultation.</em>
</p>
