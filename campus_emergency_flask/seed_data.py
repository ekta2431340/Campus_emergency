"""
Database Seeder Script
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

import os
from datetime import datetime, timedelta
from app import create_app
from app.models import db, User, ResponderProfile, Incident, IncidentUpdate, NotificationLog
from app.ml.rule_engine import analyze_rules
from app.ml.summarizer import summarize_incident

app = create_app()

def seed_database():
    with app.app_context():
        print("Initializing database schema...")
        db.drop_all()
        db.create_all()

        print("Seeding demo accounts...")
        # 1. Admin Account
        admin = User(
            name="Dr. Priya Nair",
            email="admin@campus.edu",
            role="Admin",
            phone="+91-9876500001",
            campus_id="EMP-SEC-001"
        )
        admin.set_password("admin123")
        db.session.add(admin)

        # 2. Student Accounts
        student1 = User(
            name="Aarav Sharma",
            email="student@campus.edu",
            role="Student",
            phone="+91-9876500002",
            campus_id="BCA-2023-014"
        )
        student1.set_password("student123")
        db.session.add(student1)

        student2 = User(
            name="Ananya Verma",
            email="ananya@campus.edu",
            role="Student",
            phone="+91-9876500003",
            campus_id="BCA-2023-042"
        )
        student2.set_password("student123")
        db.session.add(student2)

        # 3. Responders
        resp1_user = User(
            name="Officer Rajesh Kumar",
            email="responder.fire@campus.edu",
            role="Responder",
            phone="+91-9876500011",
            campus_id="RESP-FIRE-01"
        )
        resp1_user.set_password("resp123")
        db.session.add(resp1_user)

        resp2_user = User(
            name="Paramedic Sneha Roy",
            email="responder.medical@campus.edu",
            role="Responder",
            phone="+91-9876500012",
            campus_id="RESP-MED-02"
        )
        resp2_user.set_password("resp123")
        db.session.add(resp2_user)

        resp3_user = User(
            name="Head Guard Vikram Singh",
            email="responder.security@campus.edu",
            role="Responder",
            phone="+91-9876500013",
            campus_id="RESP-SEC-03"
        )
        resp3_user.set_password("resp123")
        db.session.add(resp3_user)

        db.session.commit()

        # Responder Profiles with GPS positions around campus
        prof1 = ResponderProfile(
            user_id=resp1_user.id,
            specialization="Fire & Hazmat",
            current_status="Available",
            latitude=12.9730,
            longitude=77.5950,
            assigned_vehicle="Rapid Response Fire Jeep #1"
        )
        prof2 = ResponderProfile(
            user_id=resp2_user.id,
            specialization="Medical",
            current_status="Available",
            latitude=12.9715,
            longitude=77.5940,
            assigned_vehicle="Campus Electric Ambulance #3"
        )
        prof3 = ResponderProfile(
            user_id=resp3_user.id,
            specialization="Security",
            current_status="On Duty",
            latitude=12.9708,
            longitude=77.5915,
            assigned_vehicle="Patrol Golf Buggy #4"
        )
        db.session.add_all([prof1, prof2, prof3])
        db.session.commit()

        print("Seeding sample incident emergencies...")
        # Incident 1: Critical Fire
        inc1 = Incident(
            student_id=student1.id,
            reporter_name=student1.name,
            reporter_phone=student1.phone,
            incident_type="Fire",
            message="Thick black smoke and chemical flames erupting in Chemistry Lab 204. Reagent bottles exploding on bench, immediate evacuation needed.",
            location_name="Science Complex & Chemistry Labs",
            latitude=12.9735,
            longitude=77.5955,
            people_count=15,
            severity_score=9.5,
            severity_level="High",
            summary='[URGENT] Fire at Science Complex: "Thick black smoke and chemical flames erupting" (affecting ~15 people).',
            rule_score=9.5,
            ml_level="High",
            ml_confidence=0.94,
            status="In-Progress",
            assigned_responder_id=prof1.id,
            admin_notes="Fire squad dispatched with chemical foam extinguishers.",
            created_at=datetime.utcnow() - timedelta(minutes=24)
        )
        db.session.add(inc1)

        # Incident 2: High Medical
        inc2 = Incident(
            student_id=student2.id,
            reporter_name=student2.name,
            reporter_phone=student2.phone,
            incident_type="Medical",
            message="Senior professor collapsed in CS Seminar Hall A, unconscious and not breathing, need defibrillator and oxygen urgently!",
            location_name="Main Academic Block (CS & IT Wing)",
            latitude=12.9720,
            longitude=77.5940,
            people_count=1,
            severity_score=9.2,
            severity_level="High",
            summary='[URGENT] Medical at Main Academic Block: "Senior professor collapsed unconscious not breathing" (affecting 1 individual).',
            rule_score=9.2,
            ml_level="High",
            ml_confidence=0.96,
            status="Assigned",
            assigned_responder_id=prof2.id,
            admin_notes="Ambulance unit routed with AED defibrillator unit.",
            created_at=datetime.utcnow() - timedelta(minutes=10)
        )
        db.session.add(inc2)

        # Incident 3: Medium Hazard
        inc3 = Incident(
            student_id=student1.id,
            reporter_name=student1.name,
            reporter_phone=student1.phone,
            incident_type="Hazard",
            message="Strong sulfur and ammonia gas smell spreading through the ground floor corridor. Students coughing and leaving area.",
            location_name="Central Library & Digital Reading Hall",
            latitude=12.9712,
            longitude=77.5932,
            people_count=8,
            severity_score=5.8,
            severity_level="Medium",
            summary='[ATTENTION] Hazard at Central Library: "Strong sulfur and ammonia gas smell spreading" (affecting ~8 people).',
            rule_score=5.8,
            ml_level="Medium",
            ml_confidence=0.78,
            status="Pending",
            created_at=datetime.utcnow() - timedelta(minutes=5)
        )
        db.session.add(inc3)

        # Incident 4: Low Routine
        inc4 = Incident(
            student_id=student2.id,
            reporter_name=student2.name,
            reporter_phone=student2.phone,
            incident_type="General",
            message="Student lost laptop bag with campus ID cards near Sports Complex pavilion.",
            location_name="Auditorium & Indoor Sports Complex",
            latitude=12.9740,
            longitude=77.5925,
            people_count=1,
            severity_score=1.5,
            severity_level="Low",
            summary='[ROUTINE] General at Sports Complex: "Student lost laptop bag with campus ID cards" (affecting 1 individual).',
            rule_score=1.5,
            ml_level="Low",
            ml_confidence=0.91,
            status="Resolved",
            resolved_at=datetime.utcnow() - timedelta(minutes=45),
            admin_notes="Bag recovered at reception desk.",
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.session.add(inc4)

        db.session.commit()

        # Seed sample notifications
        notif1 = NotificationLog(
            incident_id=inc1.id,
            dispatch_id="MOCK-NOTIF-98F12A",
            recipient_name="Officer Rajesh Kumar",
            recipient_contact="RESP-FIRE-01",
            channel="Push",
            subject="CRITICAL DISPATCH: Fire [Sev 9.5/10]",
            content=inc1.summary,
            status="Delivered",
            timestamp=datetime.utcnow() - timedelta(minutes=24)
        )
        notif2 = NotificationLog(
            incident_id=inc2.id,
            dispatch_id="MOCK-NOTIF-44B8C1",
            recipient_name="Paramedic Sneha Roy",
            recipient_contact="+91-9876500012",
            channel="SMS",
            subject="Campus Emergency SMS",
            content="ALERT: Medical at Main Academic Block. ETA: ~2m. Defibrillator required.",
            status="Delivered",
            timestamp=datetime.utcnow() - timedelta(minutes=10)
        )
        db.session.add_all([notif1, notif2])
        db.session.commit()

        print("Database seeding completed successfully!")
        print("Sample accounts:")
        print("  Admin:     admin@campus.edu     | admin123")
        print("  Student:   student@campus.edu   | student123")
        print("  Responder: responder.fire@campus.edu | resp123")

if __name__ == '__main__':
    seed_database()
