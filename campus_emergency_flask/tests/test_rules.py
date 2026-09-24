"""
Unit Tests for Rule Engine and Severity Classification
Context-Aware AI Campus Emergency Orchestration System
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from app.ml.rule_engine import analyze_rules

class TestRuleEngine(unittest.TestCase):
    def test_critical_life_threat_detection(self):
        res = analyze_rules("Medical", "Student unconscious and not breathing in biology lab", people_count=1)
        self.assertGreaterEqual(res["rule_score"], 7.0)
        self.assertEqual(res["rule_level"], "High")
        self.assertGreaterEqual(res["critical_hits"], 1)

    def test_fire_chemical_explosion(self):
        res = analyze_rules("Fire", "Chemicals exploding in Chemistry Lab thick smoke", people_count=10)
        self.assertGreaterEqual(res["rule_score"], 8.0)
        self.assertEqual(res["rule_level"], "High")

    def test_routine_incident_deescalation(self):
        res = analyze_rules("General", "Lost my student id card near library desk", people_count=1)
        self.assertLess(res["rule_score"], 4.0)
        self.assertEqual(res["rule_level"], "Low")

    def test_mass_casualty_boost(self):
        res1 = analyze_rules("Hazard", "Ammonia gas leak smell", people_count=1)
        res2 = analyze_rules("Hazard", "Ammonia gas leak smell", people_count=30)
        self.assertGreater(res2["rule_score"], res1["rule_score"])

if __name__ == '__main__':
    unittest.main()
