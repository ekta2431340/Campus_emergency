"""
Unit Tests for Haversine Geolocation Routing
Context-Aware AI Campus Emergency Orchestration System
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from app.ml.routing import haversine_distance, calculate_eta_minutes, find_nearest_responders

class TestHaversineRouting(unittest.TestCase):
    def test_haversine_distance_zero(self):
        dist = haversine_distance(12.9716, 77.5946, 12.9716, 77.5946)
        self.assertAlmostEqual(dist, 0.0, places=3)

    def test_haversine_distance_campus_scale(self):
        # Academic block to Science complex (~200m)
        dist = haversine_distance(12.9720, 77.5940, 12.9735, 77.5955)
        self.assertGreater(dist, 0.1)
        self.assertLess(dist, 0.5)

    def test_eta_calculation(self):
        eta = calculate_eta_minutes(0.5, "Medical")
        self.assertGreaterEqual(eta, 1)

    def test_find_nearest_responders_sorting(self):
        responders = [
            {"id": 1, "name": "Far Guard", "specialization": "Security", "status": "Available", "latitude": 12.9800, "longitude": 77.6000},
            {"id": 2, "name": "Close Doctor", "specialization": "Medical", "status": "Available", "latitude": 12.9721, "longitude": 77.5941},
            {"id": 3, "name": "Off Duty Fire", "specialization": "Fire", "status": "Off Duty", "latitude": 12.9719, "longitude": 77.5939}
        ]
        ranked = find_nearest_responders(12.9720, 77.5940, "Medical", responders)
        self.assertEqual(ranked[0]["name"], "Close Doctor")

if __name__ == '__main__':
    unittest.main()
