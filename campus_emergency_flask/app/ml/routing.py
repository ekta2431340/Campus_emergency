"""
Haversine-Based Responder Routing & Proximity Dispatcher
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

import math
from typing import List, Dict, Optional, Tuple

EARTH_RADIUS_KM = 6371.0  # Mean radius of Earth in km

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates using the Haversine formula.
    Returns distance in kilometers.
    """
    try:
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * \
            math.sin(delta_lambda / 2.0) ** 2

        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        distance_km = EARTH_RADIUS_KM * c
        return round(distance_km, 4)
    except Exception:
        return 0.0

def calculate_eta_minutes(distance_km: float, responder_type: str = "Security") -> int:
    """
    Estimates responder arrival time based on campus terrain and dispatch unit speed.
    - Medical/Ambulance: ~25 km/h on campus roads
    - Fire Squad: ~20 km/h
    - Security Patrol (Buggy/Bicycle): ~15 km/h
    - Foot Patrol: ~5 km/h
    """
    speeds = {
        "Medical": 25.0,
        "Fire": 20.0,
        "Security": 15.0,
        "General": 12.0
    }
    speed_kmh = speeds.get(responder_type, 15.0)
    
    # Base travel hours + 1 min prep/turnout time
    travel_minutes = (distance_km / speed_kmh) * 60.0
    total_eta = max(1, round(travel_minutes + 1))
    return total_eta

def find_nearest_responders(
    incident_lat: float, 
    incident_lon: float, 
    incident_type: str,
    responders_list: List[Dict]
) -> List[Dict]:
    """
    Ranks responders according to Haversine distance, specialization match,
    and current duty availability.
    """
    results = []
    
    # Recommended unit specialty mapping
    specialty_priority = {
        "Medical": ["Medical", "Paramedic", "First Aid", "Doctor", "Nurse"],
        "Fire": ["Fire", "Hazmat", "Safety Marshal"],
        "Violence": ["Security", "Police Liaison", "Campus Warden"],
        "Hazard": ["Safety Marshal", "Chemical Safety", "Security"],
        "Structural": ["Facility Engineer", "Safety Marshal", "Security"],
        "General": ["Security", "Warden", "Staff Volunteer"]
    }
    target_specialties = specialty_priority.get(incident_type, ["Security"])

    for resp in responders_list:
        resp_lat = resp.get("latitude", incident_lat)
        resp_lon = resp.get("longitude", incident_lon)
        
        dist_km = haversine_distance(incident_lat, incident_lon, resp_lat, resp_lon)
        dist_m = int(dist_km * 1000)
        
        eta = calculate_eta_minutes(dist_km, resp.get("specialization", "Security"))
        
        # Check domain match
        specialization = resp.get("specialization", "")
        is_specialty_match = any(t.lower() in specialization.lower() for t in target_specialties)
        
        results.append({
            **resp,
            "distance_km": dist_km,
            "distance_meters": dist_m,
            "eta_minutes": eta,
            "is_specialty_match": is_specialty_match
        })

    # Sort available responders first, then specialty match, then shortest distance
    def sort_key(item):
        status_rank = 0 if item.get("status") == "Available" else (1 if item.get("status") == "Busy" else 2)
        match_rank = 0 if item.get("is_specialty_match") else 1
        return (status_rank, match_rank, item.get("distance_meters", 999999))

    results.sort(key=sort_key)
    return results
