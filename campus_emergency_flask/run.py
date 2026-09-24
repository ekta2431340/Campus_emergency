"""
Application Entry Point
Context-Aware AI Campus Emergency Orchestration System
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
        # Ensure database tables exist and seed default accounts if empty
        db.create_all()
        if not User.query.first():
            print("First run detected: automatically seeding default accounts and sample data...")
            try:
                from seed_data import seed_database
                seed_database()
            except Exception as e:
                print(f"Warning during seeding: {e}")

if __name__ == '__main__':
    initialize_app()
    port = int(os.environ.get('PORT', 5000))
    print("\n" + "=" * 70)
    print("  CONTEXT-AWARE AI CAMPUS EMERGENCY ORCHESTRATION SYSTEM")
    print("  BCA Final-Year Capstone Project")
    print(f"  Server running locally at: http://127.0.0.1:{port}")
    print("  Default Login Accounts:")
    print("    - Admin:     admin@campus.edu     / admin123")
    print("    - Student:   student@campus.edu   / student123")
    print("    - Responder: responder.fire@campus.edu / resp123")
    print("=" * 70 + "\n")
    app.run(host='0.0.0.0', port=port, debug=True)
