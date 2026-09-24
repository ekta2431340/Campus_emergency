"""
First Responder Portal Routes
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

from datetime import datetime
from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from app.models import db, Incident, ResponderProfile, IncidentUpdate

responder_bp = Blueprint('responder', __name__)

def responder_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role not in ['Responder', 'Admin']:
            flash("Responder privileges required to access the tactical unit portal.", "danger")
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@responder_bp.route('/dashboard')
@login_required
@responder_required
def dashboard():
    profile = ResponderProfile.query.filter_by(user_id=current_user.id).first()
    
    if not profile and current_user.role == 'Admin':
        # Default fallback responder profile for admin testing
        profile = ResponderProfile.query.first()

    assigned_cases = []
    if profile:
        assigned_cases = Incident.query.filter_by(assigned_responder_id=profile.id).order_by(Incident.created_at.desc()).all()

    # Active broadcast alerts (high severity pending incidents)
    broadcast_alerts = Incident.query.filter(
        Incident.status.in_(['Pending', 'Assigned']),
        Incident.severity_level.in_(['High', 'Medium'])
    ).order_by(Incident.severity_score.desc()).limit(5).all()

    return render_template('responder/dashboard.html',
                           profile=profile,
                           assigned_cases=assigned_cases,
                           broadcast_alerts=broadcast_alerts)

@responder_bp.route('/update-status', methods=['POST'])
@login_required
@responder_required
def update_status():
    profile = ResponderProfile.query.filter_by(user_id=current_user.id).first()
    if profile:
        new_status = request.form.get('current_status')
        lat_str = request.form.get('latitude')
        lon_str = request.form.get('longitude')
        
        if new_status in ['Available', 'On Duty', 'Busy', 'Off Duty']:
            profile.current_status = new_status
            
        if lat_str and lon_str:
            try:
                profile.latitude = float(lat_str)
                profile.longitude = float(lon_str)
                profile.last_location_update = datetime.utcnow()
            except ValueError:
                pass
                
        db.session.commit()
        flash(f"Tactical status updated to: {profile.current_status}.", "success")
        
    return redirect(url_for('responder.dashboard'))

@responder_bp.route('/case/<int:id>/update', methods=['POST'])
@login_required
@responder_required
def update_case(id):
    incident = Incident.query.get_or_404(id)
    action_status = request.form.get('action_status')
    field_notes = request.form.get('field_notes', '').strip()

    valid_statuses = ['In-Progress', 'On Scene', 'Resolved']
    if action_status in valid_statuses:
        incident.status = 'In-Progress' if action_status == 'On Scene' else action_status
        if action_status == 'Resolved':
            incident.resolved_at = datetime.utcnow()
            profile = ResponderProfile.query.filter_by(user_id=current_user.id).first()
            if profile:
                profile.current_status = 'Available'

        update_entry = IncidentUpdate(
            incident_id=incident.id,
            user_id=current_user.id,
            status_change=action_status,
            notes=f"[{current_user.name} - {action_status}]: {field_notes or 'Tactical status advanced.'}"
        )
        db.session.add(update_entry)
        db.session.commit()
        flash(f"Incident #{incident.id} updated to {action_status}.", "info")

    return redirect(url_for('responder.dashboard'))
