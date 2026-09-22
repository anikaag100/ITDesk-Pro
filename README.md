# 💻 ITDesk-Pro

> A smart IT support portal that automatically categorizes support tickets, tracks resolution deadlines, and auto-resolves common tech issues using pre-built automation scripts.

[![CI/CD Pipeline](https://github.com/anikaag100/ITDesk-Pro/actions/workflows/ci.yml/badge.svg)](https://github.com/anikaag100/ITDesk-Pro/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 💡 What is this project?

In any college or company, people face routine computer problems every day:
- *"VPN is not connecting."*
- *"Account got locked / password reset needed."*
- *"Laptop disk is completely full."*
- *"Database query is stuck."*

Normally, a support engineer has to manually read each ticket and perform simple, repetitive steps. 

**ITDesk-Pro solves this by automating the routine stuff:**
1. You describe your problem in plain words.
2. The system automatically figures out the **Category** (Network, Access, Hardware, etc.) and how **Urgent** it is.
3. For common problems, a **Bot Runbook** can run a self-healing script to fix the issue in seconds and close the ticket automatically.

---

## ⚡ Key Highlights

- **Smart Triage:** Live detection of category and urgency (P1 Critical to P4 Low) as you type your issue.
- **1-Click Self-Healing Bot:** Runs simulated fix scripts (like clearing DNS cache or unlocking accounts) and logs every step.
- **SLA Timers:** Visual countdown badges showing how much time is left before an issue breaches its deadline.
- **Full History Log:** An audit timeline showing who created, updated, or resolved the ticket.
- **Clean Dashboard:** Built with a modern, responsive React interface.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons
- **Backend:** Python (FastAPI) + SQLAlchemy
- **Database:** SQLite (local development) / PostgreSQL (production)
- **DevOps:** Docker Compose & GitHub Actions (CI/CD)

---

## 🤖 Built-In Automation Scripts (Runbooks)

| Script Name | Target Area | What It Does |
|---|---|---|
| `NETWORK_VPN_RESTART` | Network | Flushes DNS cache, resets virtual network adapter, and pings gateway. |
| `ACCESS_PASSWORD_RESET` | Access | Invalidates old sessions, generates temporary credentials, and sends alert. |
| `DISK_TEMP_CLEANUP` | Hardware / Storage | Compresses old logs, removes temp cache, and frees up storage space. |
| `DATABASE_IDLE_KILL` | Database | Detects and safely terminates frozen or inactive database connections. |

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Start the Backend
Open a terminal:
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
- Backend API will run at `http://127.0.0.1:8000`
- Interactive API Docs will be available at `http://127.0.0.1:8000/docs`

---

### Step 2: Start the Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your web browser.

---

### 🐳 Run with Docker (Optional)
If you have Docker installed, you can launch the whole project with one command:
```bash
docker compose up --build -d
```

---

## 📄 License

Distributed under the **MIT License**. Created by [Anika](https://github.com/anikaag100) & open source contributors.
