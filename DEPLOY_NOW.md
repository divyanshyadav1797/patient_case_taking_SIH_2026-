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

## 🌐 Option 2: Live Public Link (Active via Cloudflare BAT Launcher)

To launch the live online server at any time, simply double-click:
👉 **`START_CLOUD_SERVER.bat`**

This automatically compiles the latest frontend, binds the unified server with MongoDB, and launches Cloudflare Tunnel.

> **Active Live Public URL**: **[https://flex-influenced-vocal-computer.trycloudflare.com](https://flex-influenced-vocal-computer.trycloudflare.com)**

- **Patient Portal**: `https://flex-influenced-vocal-computer.trycloudflare.com/login?role=patient`
- **Doctor Portal**: `https://flex-influenced-vocal-computer.trycloudflare.com/login?role=doctor`
- **Hospital Portal**: `https://flex-influenced-vocal-computer.trycloudflare.com/login?role=hospital`
- **OPD Kiosk Terminal**: `https://flex-influenced-vocal-computer.trycloudflare.com/kiosk`
- **API Status**: `https://flex-influenced-vocal-computer.trycloudflare.com/health`

*(This URL is live and works on any phone, tablet, or laptop worldwide).*
