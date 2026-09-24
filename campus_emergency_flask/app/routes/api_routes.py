"""
REST API Endpoints for AI Orchestration & Geolocation
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

from flask import Blueprint, request, jsonify
from app.models import Incident, ResponderProfile, NotificationLog
from app.ml.rule_engine import analyze_rules
from app.ml.ml_model import ml_service
from app.ml.summarizer import summarize_incident
from app.ml.routing import find_nearest_responders, haversine_distance

api_bp = Blueprint('api', __name__)

@api_bp.route('/predict', methods=['POST'])
def predict_severity():
    """
    Public test bench endpoint for evaluating raw emergency text
    using the dual Rule-Engine + TF-IDF Logistic Regression pipeline.
    """
    data = request.get_json() or {}
    incident_type = data.get('incident_type', 'General')
    message = data.get('message', '')
    people_count = int(data.get('people_count', 1) or 1)
    location_name = data.get('location_name', 'Campus Facility')

    # Step 1: Rule Engine
    rule_res = analyze_rules(incident_type, message, people_count)
    
    # Step 2: ML Model
    ml_res = ml_service.predict(incident_type, message)

    # Step 3: Hybrid Severity Fusion
    if rule_res["critical_hits"] > 0:
        final_score = rule_res["rule_score"]
        final_level = "High" if final_score >= 7.0 else "Medium"
    else:
        ml_map = {"Low": 2.0, "Medium": 5.0, "High": 8.5}
        ml_score = ml_map.get(ml_res["ml_level"], 5.0)
        final_score = round((0.6 * rule_res["rule_score"]) + (0.4 * ml_score), 1)
        final_level = "High" if final_score >= 7.0 else ("Medium" if final_score >= 4.0 else "Low")

    # Step 4: NLP Summary
    summary = summarize_incident(
        incident_type=incident_type,
        message=message,
        location_name=location_name,
        people_count=people_count,
        severity_level=final_level
    )

    return jsonify({
        "success": True,
        "final_severity_score": final_score,
        "final_severity_level": final_level,
        "rule_analysis": rule_res,
        "ml_analysis": ml_res,
        "summary": summary
    })

@api_bp.route('/responders', methods=['GET'])
def get_responders_proximity():
    """Returns responders sorted by Haversine distance from given lat & lon."""
    lat = float(request.args.get('lat', 12.9716))
    lon = float(request.args.get('lon', 77.5946))
    inc_type = request.args.get('type', 'General')

    all_resps = [r.to_dict() for r in ResponderProfile.query.all()]
    ranked = find_nearest_responders(lat, lon, inc_type, all_resps)
    return jsonify({"responders": ranked})

@api_bp.route('/stats', methods=['GET'])
def get_stats():
    incidents = Incident.query.all()
    total = len(incidents)
    high = sum(1 for i in incidents if i.severity_level == 'High')
    medium = sum(1 for i in incidents if i.severity_level == 'Medium')
    low = sum(1 for i in incidents if i.severity_level == 'Low')
    pending = sum(1 for i in incidents if i.status in ['Pending', 'Assigned', 'In-Progress'])
    resolved = sum(1 for i in incidents if i.status == 'Resolved')

    return jsonify({
        "total_incidents": total,
        "high_severity": high,
        "medium_severity": medium,
        "low_severity": low,
        "pending": pending,
        "resolved": resolved
    })
