"""
Integration Tests for Flask Web Endpoints
Context-Aware AI Campus Emergency Orchestration System
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from app import create_app
from app.models import db, User

class TestFlaskEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            # Seed test user
            u = User(name="Test Student", email="test@campus.edu", role="Student")
            u.set_password("pass123")
            db.session.add(u)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_login_page_renders(self):
        resp = self.client.get('/login')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b"Portal Authentication", resp.data)

    def test_predict_api_endpoint(self):
        payload = {
            "incident_type": "Medical",
            "message": "Student unconscious and not breathing",
            "people_count": 1,
            "location_name": "CS Lab"
        }
        resp = self.client.post('/api/predict', json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["final_severity_level"], "High")

if __name__ == '__main__':
    unittest.main()
