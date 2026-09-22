# 🛠️ ITDesk-Pro | Enterprise Automated IT Support & Incident Resolver

> An intelligent, self-healing IT incident management platform that automatically categorizes support tickets, calculates SLAs, and resolves routine enterprise issues without human intervention.

[![CI/CD Pipeline](https://github.com/anikaag100/ITDesk-Pro/actions/workflows/ci.yml/badge.svg)](https://github.com/anikaag100/ITDesk-Pro/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Deploy-Docker%20Compose-2496ED.svg?logo=docker&logoColor=white)](https://docker.com)

---

## 📌 The Problem & Our Solution

| Traditional IT Helpdesk ⏳ | With ITDesk-Pro ⚡ |
|---|---|
| Employees wait hours for simple tasks like VPN resets or password unlocks. | **Instant Resolution:** Common issues are resolved in **~160ms** by automated runbooks. |
| Support teams waste 60% of their time on repetitive routine tickets. | **Zero-Touch Automation:** System bot executes self-healing scripts safely in the background. |
| Manual priority triage leads to delayed response on critical production outages. | **Smart Triage:** The system scans title/description keywords and automatically flags **P1 Critical** alerts. |
| Vague resolution notes and untracked time limits. | **Strict SLA Engine:** Live countdown timers with complete, tamper-proof `SYSTEM_BOT` audit trails. |

---

## ✨ Key Features

- 🧠 **Smart Incident Triage:** Automatically detects incident priority (P1 Critical down to P4 Low) and department category (`NETWORK`, `DATABASE`, `ACCESS_MANAGEMENT`, `HARDWARE`) from the text as you type.
- 🤖 **Self-Healing Runbooks:** 1-Click or zero-touch execution of verified remediation scripts that simulate real-world IT actions (e.g. flushing DNS, clearing zombie DB queries, rotating logs).
- ⏱️ **Real-Time SLA Tracking:** Dynamically assigns resolution deadlines (P1 = 2 hrs, P2 = 8 hrs, P3 = 24 hrs, P4 = 48 hrs) with visual color-coded warnings (Green / Yellow / Red).
- 📜 **Full Audit Logging:** Every ticket transition, human edit, and bot remediation action is permanently recorded with microsecond timestamps and execution status.
- 💻 **Terminal-Style Execution Drawer:** Inspect live stdout logs from bot scripts right from the React UI dashboard.

---

## 🧩 System Architecture

```text
       [ 👤 Employee / IT Engineer ]
                     │
                     ▼
       [ 💻 React Dashboard (Vite + Tailwind) ]
                     │
             (REST API Calls)
                     │
                     ▼
       [ ⚡ FastAPI Backend Application ]
         ├── 🧠 Smart Triage Service (Keyword Analysis)
         ├── ⏱️ SLA Engine (Deadline Computation)
         └── 🤖 Runbook Engine (Self-Healing Scripts)
                     │
                     ▼
       [ 🗄️ Database (PostgreSQL / SQLite) ]
         ├── Users & Roles
         ├── Incident Tickets
         └── Immutable Audit Trail Logs
```

---

## 🚀 Quickstart Guide

### Option A: 1-Click Docker Deployment (Recommended)

Deploy the full production stack (PostgreSQL + FastAPI + React + Nginx) with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/anikaag100/ITDesk-Pro.git
cd ITDesk-Pro

# Build and start all containerized services
docker compose up --build -d
```

- 🌐 **React Frontend Dashboard**: [http://localhost](http://localhost)
- ⚡ **FastAPI Backend & API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **PostgreSQL Database**: `localhost:5432` (`it_resolver_db`)

---

### Option B: Local Manual Setup (Development Mode)

#### 1. Backend Setup (FastAPI + SQLite)
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# On Windows:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
python test_backend.py

# Launch development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤖 Self-Healing Runbook Scenarios

| Runbook ID | Target Issue | Simulated Remediation Steps |
|---|---|---|
| `NETWORK_VPN_RESTART` | VPN Gateway Unreachable / Network Tunnels Down | Flushes local DNS cache, resets TAP/Virtual network adapter interfaces, and pings gateway. |
| `ACCESS_PASSWORD_RESET` | Account Locked / Password Reset Request | Revokes active OAuth/OIDC refresh tokens, generates one-time reset code, and sends audit alert. |
| `DISK_TEMP_CLEANUP` | Low Storage / High RAM Usage | Compresses rotated syslog archives, purges temporary cache directories, reclaims ~14.8 GB space. |
| `DATABASE_IDLE_KILL` | PostgreSQL Deadlocks / Query Latency | Queries `pg_stat_activity` for idle-in-transaction sessions >300s and executes `pg_terminate_backend()`. |

---

## 📄 License & Maintainers

Distributed under the **MIT License**. Created by [Anika](https://github.com/anikaag100) & open source contributors.
