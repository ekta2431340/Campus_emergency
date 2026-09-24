import JSZip from 'jszip';

export async function downloadPythonProjectZip(): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('campus_emergency_system')!;

  // 1. Root files
  root.file(
    'requirements.txt',
    `Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.3
Flask-WTF==1.2.1
WTForms==3.1.2
scikit-learn==1.5.0
pandas==2.2.2
numpy==1.26.4
joblib==1.4.2
python-dotenv==1.0.1
Werkzeug==3.0.3
email-validator==2.1.1
`
  );

  root.file(
    'run.py',
    `"""
Application Entry Point - Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
Execution on Windows:
    pip install -r requirements.txt
    python run.py
"""

import os
import sys
from app import create_app
from app.models import db, User

app = create_app()

def initialize_app():
    with app.app_context():
        db.create_all()
        if not User.query.first():
            print("First run: automatically seeding default accounts and sample data...")
            try:
                from seed_data import seed_database
                seed_database()
            except Exception as e:
                print(f"Warning during seeding: {e}")

if __name__ == '__main__':
    initialize_app()
    port = int(os.environ.get('PORT', 5000))
    print("\\n" + "=" * 70)
    print("  CONTEXT-AWARE AI CAMPUS EMERGENCY ORCHESTRATION SYSTEM")
    print("  BCA Final-Year Capstone Project")
    print(f"  Server running locally at: http://127.0.0.1:{port}")
    print("  Default Login Accounts:")
    print("    - Admin:     admin@campus.edu     / admin123")
    print("    - Student:   student@campus.edu   / student123")
    print("    - Responder: responder.fire@campus.edu / resp123")
    print("=" * 70 + "\\n")
    app.run(host='0.0.0.0', port=port, debug=True)
`
  );

  root.file(
    'config.py',
    `import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'bca-final-year-campus-emergency-secret-key-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'campus_emergency.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = True
    DEFAULT_CAMPUS_LAT = 12.9716
    DEFAULT_CAMPUS_LON = 77.5946
    MOCK_NOTIFICATIONS = True
`
  );

  root.file(
    'seed_data.py',
    `import os
from datetime import datetime, timedelta
from app import create_app
from app.models import db, User, ResponderProfile, Incident, NotificationLog

app = create_app()

def seed_database():
    with app.app_context():
        print("Initializing database...")
        db.drop_all()
        db.create_all()

        admin = User(name="Dr. Priya Nair", email="admin@campus.edu", role="Admin", phone="+91-9876500001", campus_id="EMP-SEC-001")
        admin.set_password("admin123")
        db.session.add(admin)

        student = User(name="Aarav Sharma", email="student@campus.edu", role="Student", phone="+91-9876500002", campus_id="BCA-2023-014")
        student.set_password("student123")
        db.session.add(student)

        resp1 = User(name="Officer Rajesh Kumar", email="responder.fire@campus.edu", role="Responder", phone="+91-9876500011", campus_id="RESP-FIRE-01")
        resp1.set_password("resp123")
        db.session.add(resp1)

        resp2 = User(name="Paramedic Sneha Roy", email="responder.medical@campus.edu", role="Responder", phone="+91-9876500012", campus_id="RESP-MED-02")
        resp2.set_password("resp123")
        db.session.add(resp2)
        db.session.commit()

        p1 = ResponderProfile(user_id=resp1.id, specialization="Fire & Hazmat", current_status="Available", latitude=12.9730, longitude=77.5950, assigned_vehicle="Fire Jeep #1")
        p2 = ResponderProfile(user_id=resp2.id, specialization="Medical", current_status="Available", latitude=12.9715, longitude=77.5940, assigned_vehicle="Ambulance #3")
        db.session.add_all([p1, p2])
        db.session.commit()
        print("Database seeded successfully with demo accounts.")

if __name__ == '__main__':
    seed_database()
`
  );

  // 2. ML Folder
  const mlFolder = root.folder('app/ml')!;
  mlFolder.file(
    'dataset.csv',
    `incident_type,message,severity_level,severity_score,people_count
Medical,Student collapsed in CS Lab 3 unconscious not breathing need defibrillator urgently,High,9.5,1
Medical,Severe asthma attack in auditorium student cannot inhale blue lips,High,8.5,1
Medical,Person tripped on stairs minor ankle sprain conscious and sitting safely,Low,2.5,1
Medical,Small paper cut in printing shop needs bandaid,Low,1.0,1
Fire,Thick black smoke and flames coming from Chemistry Lab 204 chemicals exploding,High,10.0,15
Fire,Small trash can fire behind cafeteria smoldering already doused with water,Low,2.0,0
Violence,Physical fight outside Main Gate person brandishing sharp knife multiple students trapped,High,9.8,8
Hazard,Strong hazardous sulfur gas leak in Science Block basement students coughing dizziness,High,8.8,12
Structural,Lift elevator stuck between 3rd and 4th floor with 6 students inside panic attack,High,8.4,6
General,Lost bag containing laptop and hostel room keys at library helpdesk,Low,1.2,1
`
  );

  mlFolder.file(
    'rule_engine.py',
    `import re

LIFE_THREAT = {"unconscious": 3.5, "not breathing": 4.0, "cardiac": 3.8, "knife": 4.0, "chemicals exploding": 4.2}
MODERATE = {"smoke": 2.0, "fainted": 1.8, "gas smell": 2.2, "fight": 2.2}
LOW = {"paper cut": -1.5, "lost bag": -1.5, "lost id": -2.0}

def analyze_rules(incident_type, message, people_count=1):
    text = (message or "").lower()
    score = 5.5 if incident_type == 'Fire' else (4.5 if incident_type == 'Medical' else 3.5)
    matched = []
    for k, v in LIFE_THREAT.items():
        if k in text:
            score += v
            matched.append(k)
    for k, v in MODERATE.items():
        if k in text: score += v
    for k, v in LOW.items():
        if k in text: score += v
    if people_count > 25: score += 2.0
    elif people_count >= 5: score += 1.0
    score = max(0.5, min(10.0, round(score, 1)))
    level = "High" if score >= 7.0 else ("Medium" if score >= 4.0 else "Low")
    return {"rule_score": score, "rule_level": level, "critical_hits": len(matched)}
`
  );

  mlFolder.file(
    'routing.py',
    `import math

EARTH_RADIUS_KM = 6371.0

def haversine_distance(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return round(EARTH_RADIUS_KM * c, 4)

def calculate_eta_minutes(dist_km, spec="Security"):
    speeds = {"Medical": 25.0, "Fire": 20.0, "Security": 15.0}
    speed = speeds.get(spec, 15.0)
    return max(1, round((dist_km / speed) * 60 + 1))
`
  );

  // 3. Documentation
  const docsFolder = root.folder('docs')!;
  docsFolder.file(
    'WINDOWS_SETUP_GUIDE.md',
    `# Windows Setup Guide
1. Open Command Prompt:
   python -m venv venv
   venv\\Scripts\\activate
2. Install packages:
   pip install -r requirements.txt
3. Launch:
   python run.py
4. Open http://127.0.0.1:5000 in your browser!
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'campus_emergency_orchestration_system_bca.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
