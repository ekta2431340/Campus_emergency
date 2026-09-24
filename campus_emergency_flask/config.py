"""
Application Configuration
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'bca-final-year-campus-emergency-secret-key-2026')
    
    # SQLite default; easily switchable to MySQL (e.g. mysql+pymysql://user:pass@localhost/emergency_db)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(BASE_DIR, 'campus_emergency.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security & CSRF
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 3600
    
    # Campus Default Coordinates (Bangalore University Campus benchmark)
    DEFAULT_CAMPUS_LAT = 12.9716
    DEFAULT_CAMPUS_LON = 77.5946
    
    # Notification Settings
    MOCK_NOTIFICATIONS = True
    CRITICAL_SEVERITY_THRESHOLD = 7.0
