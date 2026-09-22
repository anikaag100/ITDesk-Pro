# Enterprise Automated IT Support & Incident Resolver (Self-Healing Platform)

[![CI/CD Pipeline](https://github.com/enterprise/it-resolver/actions/workflows/ci.yml/badge.svg)](https.github.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=flat&logo=docker)](https://www.docker.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?style=flat&logo=postgresql)](https://www.postgresql.org)

An enterprise-grade, production-ready IT automation and incident management platform built for modern enterprise environments (aligned with IBM BPT standards). The system combines **Smart Heuristic Triage**, **Dynamic SLA Computation**, and **Automated Self-Healing Runbook Remediation** wrapped in a modern React dashboard.

---

## 🚀 Key Features & Architectural Highlights

### 1. Smart Heuristic Triage Engine
- **Automated Threat Detection**: Analyzes incident titles and descriptions for critical keywords (`"outage"`, `"ransomware"`, `"production down"`, `"database leak"`) and automatically escalates priority to `P1_CRITICAL`.
- **Intelligent Categorization**: Auto-assigns incident categories (`NETWORK`, `ACCESS_MANAGEMENT`, `HARDWARE`, `DATABASE`, `GENERAL_IT`) with confidence scores.

### 2. Autonomous Self-Healing Remediation Engine
- **Extensible Runbook Registry**:
  - `NETWORK_VPN_RESTART`: Resets TAP/virtual adapter interfaces, flushes DNS resolver cache, verifies regional gateway ping.
  - `ACCESS_PASSWORD_RESET`: Revokes compromised OAuth tokens, generates a one-time reset code, and dispatches security notifications.
  - `DISK_TEMP_CLEANUP`: Compresses log archives, purges temp directories, reclaims ~14.8 GB storage space.
  - `DATABASE_IDLE_KILL`: Identifies and terminates idle-in-transaction zombie database sessions.
- **1-Click / Bot Execution**: Executes runbooks in milliseconds, updates ticket status to `RESOLVED`, and appends immutable audit records under `actor_type="SYSTEM_BOT"`.

### 3. Dynamic SLA Rules Engine
- Priority-based SLA deadline assignment:
  - **P1 Critical**: 2 Hours
  - **P2 High**: 8 Hours
  - **P3 Medium**: 24 Hours
  - **P4 Low**: 48 Hours
- Real-time SLA countdown badges (Green = >4h remaining, Yellow = <2h remaining, Red = Breached).

### 4. Enterprise Dual-Mode Database Setup
- **Development Mode**: Lightweight SQLite fallback (`sqlite:///./it_resolver.db`) requiring zero configuration.
- **Production Mode**: Full PostgreSQL 16 containerized deployment via `docker-compose`.

---

## 🛠️ System Architecture

```text
                                +---------------------------------------+
                                |  React 18 + Tailwind CSS Dashboard   |
                                |       (Vite / Nginx Port 80)          |
                                +-------------------+-------------------+
                                                    |
                                          HTTP / REST API (v1)
                                                    |
                                +-------------------v-------------------+
                                |     FastAPI Python Backend Server     |
                                |             (Port 8000)               |
                                +---------+-------------------+---------+
                                          |                   |
                     +--------------------+                   +--------------------+
                     |                                                             |
        +------------v------------+                                   +------------v------------+
        |   Smart Triage Engine   |                                   |  Auto-Remediation Engine|
        | (Heuristic Classifier)  |                                   |   (Runbook Registry)    |
        +-------------------------+                                   +-------------------------+
                     |                                                             |
                     +--------------------+                   +--------------------+
                                          |                   |
                                +---------v-------------------v---------+
                                |      SQLAlchemy 2.0 ORM Layer         |
                                +-------------------+-------------------+
                                                    |
                                +-------------------v-------------------+
                                |    PostgreSQL 16 / SQLite Database    |
                                +---------------------------------------+
```

---

## 📦 Directory Structure

```text
D:\Enterprise-IT-Resolver\
├── backend\
│   ├── app\
│   │   ├── api\v1\endpoints\     # Auth, Tickets, Remediation, Health endpoints
│   │   ├── core\                 # Config, Database Engine, Security (Bcrypt/JWT)
│   │   ├── models\               # User, Ticket, AuditLog SQLAlchemy models
│   │   ├── schemas\              # Pydantic v2 validation schemas
│   │   └── services\             # TicketService, SmartTriageService, AutoRemediationService
│   ├── main.py                   # FastAPI Application Entrypoint
│   ├── test_backend.py           # Automated Test Suite (Phases 1 & 2)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend\
│   ├── src\
│   │   ├── components\           # Navbar, MetricsOverview, CreateTicketModal, TicketList, TicketDetailDrawer, RunbookRunner
│   │   ├── services\api.js       # Axios API Service
│   │   ├── App.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── nginx.conf
├── .github\workflows\ci.yml      # CI/CD Automated Test & Build Pipeline
├── docker-compose.yml            # Multi-container orchestration (DB + API + UI)
└── README.md
```

---

## ⚡ Quick Start - Local Manual Run

### 1. Start FastAPI Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run automated tests
python test_backend.py

# Launch development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- **Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### 2. Start React Dashboard
```powershell
cd frontend
npm install
npm run dev
```
- **Dashboard UI**: [http://localhost:5173](http://localhost:5173)

---

## 🐳 1-Command Production Containerized Deployment

Deploy the entire stack (PostgreSQL 16 + FastAPI Backend + React Nginx Frontend) with a single command:

```bash
docker compose up --build -d
```

- **Frontend Application**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`it_resolver_db`)

---

## 📋 API Reference Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check and database connectivity ping |
| `POST` | `/api/v1/auth/register` | Register a new user (`EMPLOYEE`, `IT_SUPPORT`, `ADMIN`) |
| `POST` | `/api/v1/auth/token` | User authentication & JWT token generation |
| `GET` | `/api/v1/auth/users` | List all users |
| `GET` | `/api/v1/tickets/` | List incident tickets with filtering & pagination |
| `POST` | `/api/v1/tickets/` | Create incident ticket with **Smart Triage** & SLA calculation |
| `GET` | `/api/v1/tickets/{id}` | Retrieve ticket details with full audit log history |
| `PATCH` | `/api/v1/tickets/{id}/status` | Update ticket status and record audit log |
| `GET` | `/api/v1/remediation/runbooks` | List registered self-healing automated runbooks |
| `POST` | `/api/v1/tickets/{id}/remediate` | Trigger 1-Click Bot Remediation runbook on a ticket |

---

## 📄 License & Standards

Designed and built following modern Enterprise Software Architecture & IT Service Management (ITSM) standards.
