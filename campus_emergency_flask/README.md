# Context-Aware AI Campus Emergency Orchestration System
**BCA Final-Year Capstone Project**

An intelligent, context-aware web application designed to bridge the gap between campus emergency reporting and rapid tactical responder dispatch. Powered by **Python Flask**, **Bootstrap 5**, **SQLite / MySQL**, and an **NLP + Machine Learning pipeline (TF-IDF + Logistic Regression)** combined with deterministic safety rule evaluation and **Haversine great-circle proximity routing**.

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC):**
   - **Student:** Register, authenticate, submit 1-click Quick SOS or detailed incidents with GPS coordinates / campus landmarks, casualty count, and live status tracking.
   - **Admin (Command Center):** Real-time emergency queue sorted by severity score (0–10), multi-criteria filters, full AI diagnostic breakdowns, Haversine proximity-ranked responder assignment, status updates, internal notes, and notification audit logs.
   - **Tactical Responder:** Dedicated portal to view assigned emergencies, toggle duty status (`Available`, `On Duty`, `Busy`, `Off Duty`), update GPS coordinates, and transition case status (`En Route`, `On Scene`, `Resolved`).

2. **Context-Aware AI & NLP Pipeline:**
   - **Dual-Layer Severity Engine:** Deterministic rule engine checks for critical life-threatening triggers (e.g. unconscious, cardiac, fire, knife, toxic gas) combined with a TF-IDF vectorizer + Logistic Regression classifier trained on campus emergency datasets.
   - **Extractive Rule-Based NLP Summarization:** Condenses noisy distress descriptions into actionable 1-line tactical briefs for rapid SMS and push notifications.
   - **Haversine Geolocation Routing:** Computes true geodesic distances in meters between the incident and on-duty responders, estimating ETA in minutes based on transit modalities.
   - **Mock Multi-Channel Notifications:** Simulates realistic SMS, In-App Push, and Email delivery receipts with unique dispatch IDs and timestamps.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.10+, Flask 3.0, Flask-SQLAlchemy, Flask-Login, Flask-WTF
- **Machine Learning & NLP:** scikit-learn (TF-IDF Vectorizer + Logistic Regression), NumPy, Pandas
- **Database:** SQLite (default zero-config) / MySQL compatible
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+), Bootstrap 5.3, Bootstrap Icons
- **Security:** Werkzeug password hashing (PBKDF2/SHA256), CSRF session tokens, role authorization decorators

---

## ⚡ Quick Start on Windows

### 1. Prerequisites
- Python 3.10 or higher installed on Windows ([python.org](https://www.python.org/downloads/))
- Ensure `"Add Python to PATH"` is checked during installation.

### 2. Setup Virtual Environment (Recommended)
Open Command Prompt (`cmd`) or PowerShell in the project directory:
```cmd
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```cmd
pip install -r requirements.txt
```

### 4. Run the Application
```cmd
python run.py
```
Open your browser and navigate to:
👉 **`http://127.0.0.1:5000`**

*(On initial startup, `run.py` automatically initializes `campus_emergency.db` and seeds sample student, admin, and responder accounts with historical demo incidents).*

---

## 🔑 Pre-Configured Demo Accounts (For Viva & Evaluation)

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `admin123` | Dr. Priya Nair (Chief Safety Director) |
| **Student** | `student@campus.edu` | `student123` | Aarav Sharma (Hostel Resident) |
| **Responder** | `responder.fire@campus.edu` | `resp123` | Officer Rajesh Kumar (Fire & Hazmat Unit) |
| **Responder** | `responder.medical@campus.edu` | `resp123` | Paramedic Sneha Roy (Ambulance Unit) |
| **Responder** | `responder.security@campus.edu` | `resp123` | Head Guard Vikram Singh (Main Gate Patrol) |

*Tip: A quick demo role-switcher is built into the top navigation bar for seamless viva demonstration.*

---

## 🧪 Running Automated Unit Tests
To verify the rule engine, machine learning model, Haversine formula, and Flask endpoints:
```cmd
python -m unittest discover tests
```

---

## 📁 Project Directory Structure

```
campus_emergency_system/
├── requirements.txt            # Python dependencies
├── run.py                      # Flask entry point with auto-seeder
├── config.py                   # Central configuration & secret keys
├── seed_data.py                # Database population script
├── README.md                   # Project documentation
├── app/
│   ├── __init__.py             # Application factory & error handlers
│   ├── models.py               # SQLAlchemy DB entities
│   ├── ml/
│   │   ├── dataset.csv         # Emergency training dataset
│   │   ├── rule_engine.py      # Keyword weighting & heuristics
│   │   ├── ml_model.py         # TF-IDF + Logistic Regression
│   │   ├── summarizer.py       # Rule-based NLP summarizer
│   │   ├── routing.py          # Haversine distance & ETA
│   │   └── notifier.py         # Mock SMS/Push notification service
│   ├── routes/
│   │   ├── auth_routes.py      # Login, registration, role switch
│   │   ├── student_routes.py   # SOS form & tracking
│   │   ├── admin_routes.py     # Command center & assignment
│   │   ├── responder_routes.py # Field unit operations
│   │   └── api_routes.py       # REST API endpoints
│   ├── templates/              # Bootstrap 5 Jinja2 templates
│   └── static/                 # Custom CSS & JS assets
├── tests/                      # Automated test suite
└── docs/                       # BCA Project Report & Viva Voce Q&A
```
