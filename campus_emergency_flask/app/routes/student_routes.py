"""
Student Routes & Emergency SOS Submission
Context-Aware AI Campus Emergency Orchestraction System
Author: BCA Final Year Project
"""

import json
from datetime import datetime
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app.models import db, Incident, ResponderProfile, NotificationLog, IncidentUpdate
from app.ml.rule_engine import analyze_rules
from app.ml.ml_model import ml_service
from app.ml.summarizer import summarize_incident
from app.ml.routing import find_nearest_responders
from app.ml.notifier import MockNotificationDispatcher

student_bp = Blueprint('student', __name__)

CAMPUS_PRESET_LOCATIONS = [
    {"name": "Main Academic Block (CS & IT Wing)", "lat": 12.9720, "lon": 77.5940},
    {"name": "Science Complex & Chemistry Labs", "lat": 12.9735, "lon": 77.5955},
    {"name": "Central Library & Digital Reading Hall", "lat": 12.9712, "lon": 77.5932},
    {"name": "Hostel Block A (Boys Campus)", "lat": 12.9700, "lon": 77.5920},
    {"name": "Hostel Block B (Girls Campus)", "lat": 12.9690, "lon": 77.5960},
    {"name": "Student Cafeteria & Food Court", "lat": 12.9728, "lon": 77.5948},
    {"name": "Auditorium & Indoor Sports Complex", "lat": 12.9740, "lon": 77.5925},
    {"name": "Mechanical & Electrical Workshop", "lat": 12.9748, "lon": 77.5968},
    {"name": "Admin Building & Vice Chancellor Office", "lat": 12.9718, "lon": 77.5945},
    {"name": "Campus Main Entrance Gate", "lat": 12.9705, "lon": 77.5910}
]

@student_bp.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'Admin':
            return redirect(url_for('admin.dashboard'))
        elif current_user.role == 'Responder':
            return redirect(url_for('responder.dashboard'))
        return redirect(url_for('student.dashboard'))
    return redirect(url_for('auth.login'))

@student_bp.route('/student/dashboard')
@login_required
def dashboard():
    my_incidents = Incident.query.filter_by(student_id=current_user.id).order_by(Incident.created_at.desc()).all()
    return render_template('student/dashboard.html', 
                           incidents=my_incidents, 
                           locations=CAMPUS_PRESET_LOCATIONS)

@student_bp.route('/student/sos', methods=['GET', 'POST'])
@login_required
def sos_submit():
    if request.method == 'POST':
        incident_type = request.form.get('incident_type', 'General')
        message = request.form.get('message', '').strip()
        location_name = request.form.get('location_name', 'Campus Ground').strip()
        lat_str = request.form.get('latitude', '')
        lon_str = request.form.get('longitude', '')
        people_count = int(request.form.get('people_count', 1) or 1)

        # Parse coordinates or fallback to default campus landmark
        try:
            latitude = float(lat_str) if lat_str else 12.9716
            longitude = float(lon_str) if lon_str else 77.5946
        except ValueError:
            latitude, longitude = 12.9716, 77.5946

        # --- STEP 1: Rule-Based Severity Detection ---
        rule_result = analyze_rules(incident_type, message, people_count)
        rule_score = rule_result["rule_score"]
        rule_level = rule_result["rule_level"]
        triggered_rules_json = json.dumps(rule_result["triggered_rules"])

        # --- STEP 2: ML Model (TF-IDF + Logistic Regression) ---
        ml_result = ml_service.predict(incident_type, message)
        ml_level = ml_result["ml_level"]
        ml_conf = ml_result["ml_confidence"]

        # --- STEP 3: Context-Aware Fusion & Final Severity Scoring ---
        # If critical life threats were detected by rules, rule score dominates
        if rule_result["critical_hits"] > 0:
            final_severity_score = rule_score
            final_level = "High" if rule_score >= 7.0 else "Medium"
        else:
            # Weighted hybrid: 60% rule base, 40% ML probability mapping
            ml_weight_map = {"Low": 2.0, "Medium": 5.0, "High": 8.5}
            ml_estimated_score = ml_weight_map.get(ml_level, 5.0)
            final_severity_score = round((0.6 * rule_score) + (0.4 * ml_estimated_score), 1)
            
            if final_severity_score >= 7.0:
                final_level = "High"
            elif final_severity_score >= 4.0:
                final_level = "Medium"
            else:
                final_level = "Low"

        # --- STEP 4: Rule-Based NLP Message Summarization ---
        incident_summary = summarize_incident(
            incident_type=incident_type,
            message=message,
            location_name=location_name,
            people_count=people_count,
            severity_level=final_level
        )

        # --- STEP 5: Create Incident Record ---
        new_incident = Incident(
            student_id=current_user.id,
            reporter_name=current_user.name,
            reporter_phone=current_user.phone,
            incident_type=incident_type,
            message=message,
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            people_count=people_count,
            severity_score=final_severity_score,
            severity_level=final_level,
            summary=incident_summary,
            rule_score=rule_score,
            ml_level=ml_level,
            ml_confidence=ml_conf,
            triggered_rules=triggered_rules_json,
            status='Pending'
        )
        db.session.add(new_incident)
        db.session.commit()

        # Add initial incident history update
        init_update = IncidentUpdate(
            incident_id=new_incident.id,
            user_id=current_user.id,
            status_change="Pending",
            notes=f"Emergency SOS transmitted by {current_user.name}. Orchestration engine assessed severity at {final_severity_score}/10 ({final_level})."
        )
        db.session.add(init_update)
        db.session.commit()

        # --- STEP 6: Haversine-based Proximity Routing ---
        all_responders = [r.to_dict() for r in ResponderProfile.query.all()]
        ranked_responders = find_nearest_responders(latitude, longitude, incident_type, all_responders)

        # --- STEP 7: Automated Mock Notifications ---
        dispatches = MockNotificationDispatcher.broadcast_incident_teams(
            incident=new_incident.to_dict(),
            responders=ranked_responders
        )
        for d in dispatches:
            notif = NotificationLog(
                incident_id=new_incident.id,
                dispatch_id=d["dispatch_id"],
                recipient_name=d["recipient_name"],
                recipient_contact=d["recipient_contact"],
                channel=d["channel"],
                subject=d["subject"],
                content=d["content"],
                status=d["status"]
            )
            db.session.add(notif)
        db.session.commit()

        flash(f"EMERGENCY BROADCAST SENT: Severity assessed at {final_severity_score}/10 ({final_level}). Nearest responders alerted.", "danger" if final_level == "High" else "warning")
        return redirect(url_for('student.incident_tracking', id=new_incident.id))

    return render_template('student/sos.html', locations=CAMPUS_PRESET_LOCATIONS)

@student_bp.route('/student/incident/<int:id>')
@login_required
def incident_tracking(id):
    incident = Incident.query.get_or_404(id)
    if incident.student_id != current_user.id and current_user.role not in ['Admin', 'Responder']:
        flash("You are not authorized to view this emergency incident.", "danger")
        return redirect(url_for('student.dashboard'))
        
    return render_template('student/tracking.html', incident=incident)
