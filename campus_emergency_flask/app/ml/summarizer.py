"""
Context-Aware Rule-Based NLP Incident Summarizer
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

import re
from typing import Optional

def summarize_incident(incident_type: str, message: str, location_name: str, people_count: int, severity_level: str) -> str:
    """
    Synthesizes an executive dispatch summary combining NLP sentence heuristics,
    key incident indicators, location context, and casualty/occupancy count.
    Designed for fast SMS/radio relay to first responders.
    """
    raw = (message or "").strip()
    if not raw:
        return f"[{severity_level.upper()} ALERT] {incident_type} reported at {location_name} involving {people_count} person(s). Immediate response requested."

    # Extract first informative sentence or clause
    sentences = re.split(r'[.!?\n]+', raw)
    core_sentence = sentences[0].strip() if sentences else raw
    if len(core_sentence) > 120:
        core_sentence = core_sentence[:117] + "..."

    urgency_tag = "URGENT" if severity_level == "High" else ("ATTENTION" if severity_level == "Medium" else "ROUTINE")
    
    # Casualties / People descriptor
    if people_count > 1:
        people_desc = f"affecting ~{people_count} people"
    elif people_count == 1:
        people_desc = "affecting 1 individual"
    else:
        people_desc = "no direct human injuries reported"

    summary = f"[{urgency_tag}] {incident_type} at {location_name}: \"{core_sentence}\" ({people_desc})."
    return summary
