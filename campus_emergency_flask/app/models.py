"""
SQLAlchemy Database Models
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Student')  # 'Student', 'Admin', 'Responder'
    phone = db.Column(db.String(20), nullable=True)
    campus_id = db.Column(db.String(50), nullable=True)  # Roll Number or Staff ID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    incidents_reported = db.relationship('Incident', backref='reporter', foreign_keys='Incident.student_id', lazy=True)
    responder_profile = db.relationship('ResponderProfile', backref='user', uselist=False, lazy=True)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class ResponderProfile(db.Model):
    __tablename__ = 'responder_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    specialization = db.Column(db.String(50), nullable=False, default='Security')  # 'Medical', 'Fire', 'Security', 'Hazmat'
    current_status = db.Column(db.String(30), nullable=False, default='Available')  # 'Available', 'On Duty', 'Busy', 'Off Duty'
    latitude = db.Column(db.Float, nullable=False, default=12.9716)
    longitude = db.Column(db.Float, nullable=False, default=77.5946)
    assigned_vehicle = db.Column(db.String(50), nullable=True, default='Patrol Buggy #2')
    last_location_update = db.Column(db.DateTime, default=datetime.utcnow)

    assigned_incidents = db.relationship('Incident', backref='assigned_responder', foreign_keys='Incident.assigned_responder_id', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.user.name if self.user else "Responder",
            "phone": self.user.phone if self.user else "N/A",
            "specialization": self.specialization,
            "status": self.current_status,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "vehicle": self.assigned_vehicle
        }


class Incident(db.Model):
    __tablename__ = 'incidents'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reporter_name = db.Column(db.String(100), nullable=True, default="Anonymous")
    reporter_phone = db.Column(db.String(20), nullable=True)
    
    incident_type = db.Column(db.String(50), nullable=False)  # Medical, Fire, Violence, Hazard, Structural, General
    message = db.Column(db.Text, nullable=False)
    location_name = db.Column(db.String(150), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    people_count = db.Column(db.Integer, default=1)
    
    # AI & Rule Engine Analytics
    severity_score = db.Column(db.Float, nullable=False, default=5.0)  # 0.0 to 10.0
    severity_level = db.Column(db.String(20), nullable=False, default='Medium')  # Low, Medium, High
    summary = db.Column(db.Text, nullable=True)
    rule_score = db.Column(db.Float, nullable=True)
    ml_level = db.Column(db.String(20), nullable=True)
    ml_confidence = db.Column(db.Float, nullable=True)
    triggered_rules = db.Column(db.Text, nullable=True)
    
    # Workflow & State
    status = db.Column(db.String(30), nullable=False, default='Pending')  # Pending, Assigned, In-Progress, Resolved, Dismissed
    assigned_responder_id = db.Column(db.Integer, db.ForeignKey('responder_profiles.id'), nullable=True)
    admin_notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    updates = db.relationship('IncidentUpdate', backref='incident', cascade='all, delete-orphan', lazy=True)
    notifications = db.relationship('NotificationLog', backref='incident', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "reporter_name": self.reporter_name or (self.reporter.name if self.reporter else "Guest"),
            "incident_type": self.incident_type,
            "message": self.message,
            "location_name": self.location_name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "people_count": self.people_count,
            "severity_score": self.severity_score,
            "severity_level": self.severity_level,
            "summary": self.summary,
            "rule_score": self.rule_score,
            "ml_level": self.ml_level,
            "ml_confidence": self.ml_confidence,
            "status": self.status,
            "assigned_responder": self.assigned_responder.user.name if self.assigned_responder and self.assigned_responder.user else None,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }


class IncidentUpdate(db.Model):
    __tablename__ = 'incident_updates'

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status_change = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class NotificationLog(db.Model):
    __tablename__ = 'notification_logs'

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'), nullable=True)
    dispatch_id = db.Column(db.String(50), nullable=False)
    recipient_name = db.Column(db.String(100), nullable=False)
    recipient_contact = db.Column(db.String(100), nullable=False)
    channel = db.Column(db.String(20), nullable=False)  # SMS, Email, Push
    subject = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), nullable=False, default='Delivered')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
