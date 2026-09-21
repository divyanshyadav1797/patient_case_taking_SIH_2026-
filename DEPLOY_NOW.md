# 🚀 1-Click Instant Cloud Deployment Guide

The Quantum Care repository is ready for 1-click cloud deployment.

---

## ⚡ Option 1: 1-Click Deploy on Render (Recommended)

Click this link directly to deploy both the Web App and the AI Microservice automatically:

👉 **[Deploy to Render (1-Click Blueprint)](https://render.com/deploy?repo=https://github.com/divyanshyadav1797/patient_case_taking_SIH_2026-)**

### Step-by-Step Instructions:
1. Click the **Deploy to Render** link above (or open `https://render.com/deploy?repo=https://github.com/divyanshyadav1797/patient_case_taking_SIH_2026-`).
2. Log in with your GitHub account.
3. Render will read `render.yaml` and show:
   - **`quantum-care-web`** (Frontend + Express Backend)
   - **`quantum-care-ai`** (Gemini AI Microservice)
4. When prompted for Environment Variables:
   - **`MONGODB_URI`**: Paste your MongoDB Atlas URI (e.g. `mongodb+srv://<user>:<password>@cluster.mongodb.net/quantum-care?retryWrites=true&w=majority`).
   - **`GEMINI_API_KEY`**: Paste your Google Gemini API key.
5. Click **Apply Blueprint** / **Create Web Service**.
6. Render builds both services and gives you live permanent HTTPS URLs like:
   - `https://quantum-care-web.onrender.com`

---

## 🌐 Option 2: Live Public Link (Active Right Now!)

If you need a link to share with anyone immediately without waiting for Render:

> **Live Public URL**: **[https://locked-right-supreme-envelope.trycloudflare.com](https://locked-right-supreme-envelope.trycloudflare.com)**

- **Patient Portal**: `https://locked-right-supreme-envelope.trycloudflare.com/patient/login`
- **Doctor Dashboard**: `https://locked-right-supreme-envelope.trycloudflare.com/doctor/login`
- **Hospital Dashboard**: `https://locked-right-supreme-envelope.trycloudflare.com/hospital/dashboard`

*(This URL is currently live and connected to your local database and services).*
