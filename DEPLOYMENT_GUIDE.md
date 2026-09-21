# Quantum Care - Complete Cloud & Production Deployment Guide

This guide walks you through deploying **Quantum Care** into live production so it is fully functional, accessible from any device or browser, and ready for demonstrations.

---

## Architecture Overview

```
                        [ Internet Users & Kiosks ]
                                     |
                                     v
                        [ Render / Vercel / Cloud ]
                                     |
             +-----------------------+-----------------------+
             |                                               |
             v                                               v
    [ Quantum Care Web ]                           [ Quantum Care AI ]
  (React SPA + Express API)                       (Gemini 2.5 Microservice)
             |                                               |
             +-----------------------+-----------------------+
                                     |
                                     v
                           [ MongoDB Atlas ]
                         (Cloud Database M0)
```

---

## 1. Prerequisites Checklist

Before deploying, ensure you have:
1. **GitHub Repository**: Your code pushed to `https://github.com/divyanshyadav1797/patient_case_taking_SIH_2026-`.
2. **MongoDB Atlas (Free Database)**:
   - Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
   - Create a **Free Shared Cluster (M0)** (AWS / Frankfurt or Mumbai or any region).
   - Under **Database Access**, create a database user (e.g., `quantum_admin` with password).
   - Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)**.
   - Click **Connect** -> **Connect your application (Drivers)** -> Copy the connection string:
     ```
     mongodb+srv://quantum_admin:<password>@cluster0.xxxxx.mongodb.net/quantum-care?retryWrites=true&w=majority
     ```
3. **Google Gemini API Key (Free)**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Click **Create API key** and copy it.

---

## 2. Option 1: 1-Click Cloud Deployment on Render (Recommended)

Render provides free hosting for web services and natively supports the `render.yaml` blueprint included in this repository.

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "feat: configure cloud deployment, render blueprint, docker and SPA serving"
git push origin D2
# (or merge into main and push to main)
```

### Step 2: Deploy on Render
1. Sign up or log in to [Render.com](https://render.com).
2. In the top navigation, click **New +** -> select **Blueprint**.
3. Connect your GitHub account and select repository: `divyanshyadav1797/patient_case_taking_SIH_2026-`.
4. Select the branch you pushed to (`D2` or `main`).
5. Render will automatically read `render.yaml` and discover two services:
   - `quantum-care-web` (Web Service: Frontend + Express Backend)
   - `quantum-care-ai` (Web Service: Gemini AI Intake Microservice)
6. When prompted for environment variables:
   - **`MONGODB_URI`**: Paste your MongoDB Atlas connection string.
   - **`GEMINI_API_KEY`**: Paste your Google Gemini API key.
7. Click **Apply**.
8. Render will build both services automatically. Within 2-3 minutes, you will receive your live URLs:
   - Web App: `https://quantum-care-web-xxxx.onrender.com`
   - AI Service: `https://quantum-care-ai-xxxx.onrender.com`

---

## 3. Option 2: Decoupled Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on Vercel's global edge network:

### Backend & AI on Render:
1. In Render, deploy `Backend` as a Web Service:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Root Directory**: `Backend`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: `<Your MongoDB Atlas String>`
     - `CORS_ORIGIN`: `*` (or your Vercel URL)
     - `JWT_SECRET`: `<Random 32-char string>`
     - `JWT_REFRESH_SECRET`: `<Random 32-char string>`
     - `SEED_DEMO_DATA`: `true`
     - `DEV_OTP_MODE`: `true`
     - `AI_SERVICE_URL`: `<Your Render AI service URL>`

### Frontend on Vercel:
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project** -> Import `patient_case_taking_SIH_2026-`.
3. In Project Settings:
   - **Root Directory**: Select `Frontend`.
   - **Framework Preset**: `Vite`.
   - **Environment Variables**:
     - `VITE_API_URL`: `https://your-backend.onrender.com/api/v1`
4. Click **Deploy**. Vercel will automatically build the React app and deploy it globally.

---

## 4. Option 3: 1-Command Docker Deployment (VPS / AWS EC2 / DigitalOcean)

If you have a Linux VPS (Ubuntu, Debian, CentOS) or want to test locally in Docker:

1. Clone the repository on your server:
   ```bash
   git clone https://github.com/divyanshyadav1797/patient_case_taking_SIH_2026-.git
   cd patient_case_taking_SIH_2026-
   ```
2. Create `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start all services in the background:
   ```bash
   docker compose up --build -d
   ```
4. Access the platform:
   - Web App & Kiosk: `http://<your-server-ip>:5000`
   - API Health: `http://<your-server-ip>:5000/health`
   - AI Microservice: `http://<your-server-ip>:4100/health`

---

## 5. Live Verification & Testing Checklist

Once deployed, perform these verification steps on your live URL:

1. **Health Check**:
   - Visit `https://<your-deployed-url>/health`
   - Expect:
     ```json
     {
       "status": "healthy",
       "db": { "isMongoConnected": true, "databaseType": "MongoDB" }
     }
     ```
2. **Frontend UI & Roles**:
   - **Landing Page**: `https://<your-deployed-url>/`
   - **Hospital Kiosk Mode**: `https://<your-deployed-url>/kiosk`
   - **Patient Portal**: Log in with demo credentials:
     - Aadhaar / Email: `rahul.sharma@example.com`
     - Password: `patient123`
   - **Doctor Portal**:
     - Email: `dr.sarah@medicare.org`
     - Password: `doctor123`
   - **Hospital Admin**:
     - Email: `admin@smshospital.org`
     - Password: `hospital123`
   - **Kiosk Terminal Login**:
     - Terminal ID: `KIOSK-SMS-01`
     - PIN: `123456`
3. **AI Intake Clinical Triage**:
   - On the Patient Portal or Kiosk, start a new case intake (e.g., "Severe chest tightness and shortness of breath").
   - Answer the AI-generated follow-up questions.
   - Confirm the AI clinical report is generated and saved to MongoDB.
   - Verify that the Doctor Portal shows the intake summary with urgent badges and interview transcripts.

---

## 6. Environment Variables Reference

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `NODE_ENV` | Yes | App runtime environment | `production` |
| `PORT` | No | Web port (Render sets this dynamically) | `5000` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/quantum-care` |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens | Random 32+ character string |
| `JWT_REFRESH_SECRET` | Yes | Secret key for refresh tokens | Random 32+ character string |
| `GEMINI_API_KEY` | Yes | Google Gemini AI Studio API Key | `AIzaSy...` |
| `AI_SERVICE_URL` | Yes | URL to the AI microservice | `https://quantum-care-ai.onrender.com` |
| `CORS_ORIGIN` | No | Whitelist domains or wildcard | `*` |
| `SERVE_FRONTEND` | No | Serve Vite static bundle from Express | `true` |
| `SEED_DEMO_DATA` | No | Auto-seed demo accounts on first run | `true` |
| `DEV_OTP_MODE` | No | Log OTPs to server console for testing | `true` |
