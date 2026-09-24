"""
Rule-Based Severity Detection Engine
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

import re
from typing import Dict, List, Tuple

# Critical keyword dictionaries with weightings
LIFE_THREAT_KEYWORDS = {
    "unconscious": 3.5, "not breathing": 4.0, "cardiac": 3.8, "heart attack": 3.8,
    "bleeding profusely": 3.2, "head injury": 3.0, "seizure": 2.8, "choking": 3.5,
    "defibrillator": 3.0, "asthma attack": 2.8, "cyanosis": 3.5, "blue lips": 3.0,
    "anaphylaxis": 3.5, "knife": 4.0, "gun": 4.5, "weapon": 3.5, "active shooter": 5.0,
    "hostage": 4.5, "explosion": 4.0, "chemicals exploding": 4.2, "toxic gas": 3.8,
    "electrocution": 3.8, "trapped in elevator": 3.0, "structural collapse": 4.0
}

MODERATE_KEYWORDS = {
    "smoke": 2.0, "sparks": 1.8, "fainted": 1.8, "dizziness": 1.5, "fight": 2.2,
    "assault": 2.5, "intruder": 2.2, "trespassing": 1.8, "snatched": 1.8,
    "gas smell": 2.2, "water leak": 1.2, "broken glass": 1.2, "swollen": 1.5,
    "panic attack": 1.8, "hyperventilating": 2.0, "sprain": 1.0, "bleeding": 1.8
}

LOW_KEYWORDS = {
    "paper cut": -1.5, "lost id": -2.0, "lost bag": -1.5, "flickering": -1.0,
    "paracetamol": -1.5, "bandaid": -2.0, "headache": -0.8, "accidental": -2.0,
    "test": -2.0, "routine": -1.5
}

BASE_SEVERITY_BY_TYPE = {
    "Fire": 5.5,
    "Medical": 4.5,
    "Violence": 5.0,
    "Hazard": 4.0,
    "Structural": 3.8,
    "General": 2.0
}

def analyze_rules(incident_type: str, message: str, people_count: int = 1) -> Dict:
    """
    Computes a context-aware severity score (0.0 to 10.0) based on deterministic rules,
    domain safety heuristics, and contextual modifiers.
    """
    text = (message or "").lower()
    score = BASE_SEVERITY_BY_TYPE.get(incident_type, 3.0)
    triggered_rules: List[str] = []
    
    # 1. Base incident category rule
    triggered_rules.append(f"Base type '{incident_type}' weight: {score:.1f}")
    
    # 2. Life-threatening keyword evaluation
    matched_critical = []
    for kw, boost in LIFE_THREAT_KEYWORDS.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', text):
            score += boost
            matched_critical.append(f"{kw} (+{boost})")
            
    if matched_critical:
        triggered_rules.append(f"Life-threat keywords matched: {', '.join(matched_critical)}")

    # 3. Moderate keyword evaluation
    matched_mod = []
    for kw, boost in MODERATE_KEYWORDS.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', text):
            score += boost
            matched_mod.append(f"{kw} (+{boost})")
            
    if matched_mod:
        triggered_rules.append(f"Secondary alert indicators: {', '.join(matched_mod)}")

    # 4. Low-priority de-escalators
    matched_low = []
    for kw, discount in LOW_KEYWORDS.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', text):
            score += discount
            matched_low.append(f"{kw} ({discount})")
            
    if matched_low:
        triggered_rules.append(f"De-escalation modifiers: {', '.join(matched_low)}")

    # 5. People count context multiplier (Mass casualty risk)
    if people_count > 25:
        score += 2.0
        triggered_rules.append(f"High population impact (>25 people involved: +2.0)")
    elif people_count >= 5:
        score += 1.0
        triggered_rules.append(f"Multi-person exposure ({people_count} people: +1.0)")
        
    # 6. Normalize score to 0.0 - 10.0
    final_score = max(0.5, min(10.0, round(score, 1)))
    
    if final_score >= 7.0:
        level = "High"
    elif final_score >= 4.0:
        level = "Medium"
    else:
        level = "Low"
        
    return {
        "rule_score": final_score,
        "rule_level": level,
        "triggered_rules": triggered_rules,
        "critical_hits": len(matched_critical)
    }
