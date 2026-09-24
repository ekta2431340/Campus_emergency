"""
Admin Command Center Routes
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

import json
from datetime import datetime
from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app.models import db, Incident, ResponderProfile, NotificationLog, IncidentUpdate, User
from app.ml.routing import find_nearest_responders
from app.ml.notifier import MockNotificationDispatcher

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'Admin':
            flash("Administrator clearance required to access the Emergency Command Console.", "danger")
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    severity_filter = request.args.get('severity', 'all')
    status_filter = request.args.get('status', 'all')
    type_filter = request.args.get('type', 'all')
    search_query = request.args.get('q', '').strip()

    query = Incident.query

    if severity_filter != 'all':
        query = query.filter_by(severity_level=severity_filter)
    if status_filter != 'all':
        query = query.filter_by(status=status_filter)
    if type_filter != 'all':
        query = query.filter_by(incident_type=type_filter)
    if search_query:
        query = query.filter(Incident.message.ilike(f'%{search_query}%') | Incident.location_name.ilike(f'%{search_query}%'))

    # Sort primarily by severity score descending (Highest emergency first), then newest
    incidents = query.order_by(Incident.severity_score.desc(), Incident.created_at.desc()).all()

    # Calculate live statistics
    all_incidents = Incident.query.all()
    total_count = len(all_incidents)
    high_count = sum(1 for inc in all_incidents if inc.severity_level == 'High')
    pending_count = sum(1 for inc in all_incidents if inc.status in ['Pending', 'Assigned', 'In-Progress'])
    resolved_count = sum(1 for inc in all_incidents if inc.status == 'Resolved')
    avg_score = round(sum(inc.severity_score for inc in all_incidents) / total_count, 1) if total_count > 0 else 0.0

    return render_template('admin/dashboard.html',
                           incidents=incidents,
                           total_count=total_count,
                           high_count=high_count,
                           pending_count=pending_count,
                           resolved_count=resolved_count,
                           avg_score=avg_score,
                           active_severity=severity_filter,
                           active_status=status_filter,
                           active_type=type_filter,
                           search_query=search_query)

@admin_bp.route('/incident/<int:id>')
@login_required
@admin_required
def incident_detail(id):
    incident = Incident.query.get_or_404(id)
    
    # Parse triggered rules safely
    triggered_rules_list = []
    if incident.triggered_rules:
        try:
            triggered_rules_list = json.loads(incident.triggered_rules)
        except Exception:
            triggered_rules_list = [incident.triggered_rules]

    # Calculate nearest responders with Haversine distance
    all_responders = [r.to_dict() for r in ResponderProfile.query.all()]
    lat = incident.latitude or 12.9716
    lon = incident.longitude or 77.5946
    nearest_responders = find_nearest_responders(lat, lon, incident.incident_type, all_responders)

    updates = IncidentUpdate.query.filter_by(incident_id=incident.id).order_by(IncidentUpdate.timestamp.desc()).all()
    notifications = NotificationLog.query.filter_by(incident_id=incident.id).order_by(NotificationLog.timestamp.desc()).all()

    return render_template('admin/incident_detail.html',
                           incident=incident,
                           triggered_rules=triggered_rules_list,
                           nearest_responders=nearest_responders,
                           updates=updates,
                           notifications=notifications)

@admin_bp.route('/assign/<int:id>', methods=['POST'])
@login_required
@admin_required
def assign_responder(id):
    incident = Incident.query.get_or_404(id)
    responder_id = request.form.get('responder_id')
    admin_note = request.form.get('admin_note', '').strip()

    if responder_id:
        responder = ResponderProfile.query.get(int(responder_id))
        if responder:
            incident.assigned_responder_id = responder.id
            incident.status = 'Assigned'
            if admin_note:
                incident.admin_notes = f"{incident.admin_notes or ''}\n[{datetime.utcnow().strftime('%H:%M')}] {admin_note}".strip()
            
            # Update responder status to Busy
            responder.current_status = 'Busy'
            
            # Log update
            update_entry = IncidentUpdate(
                incident_id=incident.id,
                user_id=current_user.id,
                status_change='Assigned',
                notes=f"Dispatched {responder.user.name} ({responder.specialization}). Note: {admin_note or 'No extra notes.'}"
            )
            db.session.add(update_entry)
            
            # Send targeted dispatch notification
            MockNotificationDispatcher.dispatch_alert(
                recipient_name=responder.user.name,
                recipient_contact=responder.user.phone or "+91-9876543210",
                channel="SMS",
                subject="DIRECT INCIDENT ASSIGNMENT",
                content=f"URGENT: Assigned to Incident #{incident.id} ({incident.incident_type}) at {incident.location_name}.",
                incident_id=incident.id
            )
            
            db.session.commit()
            flash(f"Successfully assigned {responder.user.name} to Incident #{incident.id}.", "success")

    return redirect(url_for('admin.incident_detail', id=incident.id))

@admin_bp.route('/status/<int:id>', methods=['POST'])
@login_required
@admin_required
def update_status(id):
    incident = Incident.query.get_or_404(id)
    new_status = request.form.get('status')
    admin_notes = request.form.get('admin_notes', '').strip()

    if new_status and new_status != incident.status:
        incident.status = new_status
        if new_status == 'Resolved':
            incident.resolved_at = datetime.utcnow()
            if incident.assigned_responder:
                incident.assigned_responder.current_status = 'Available'
                
        if admin_notes:
            incident.admin_notes = f"{incident.admin_notes or ''}\n[{datetime.utcnow().strftime('%H:%M')}] Status changed to {new_status}: {admin_notes}".strip()

        update_entry = IncidentUpdate(
            incident_id=incident.id,
            user_id=current_user.id,
            status_change=new_status,
            notes=f"Admin updated status to {new_status}. {admin_notes}"
        )
        db.session.add(update_entry)
        db.session.commit()
        flash(f"Incident #{incident.id} status updated to {new_status}.", "info")

    return redirect(url_for('admin.incident_detail', id=incident.id))

@admin_bp.route('/responders')
@login_required
@admin_required
def responders():
    all_responders = ResponderProfile.query.all()
    return render_template('admin/responders.html', responders=all_responders)

@admin_bp.route('/notifications')
@login_required
@admin_required
def notifications():
    logs = NotificationLog.query.order_by(NotificationLog.timestamp.desc()).limit(100).all()
    return render_template('admin/notifications.html', logs=logs)
