"""
Mock Multi-Channel Notification Dispatcher
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

import uuid
from datetime import datetime
from typing import Dict, List

class MockNotificationDispatcher:
    """
    Simulates SMS, Email, and Push notification broadcasts to on-duty responders,
    campus authorities, and student confirmation channels without requiring paid SMS APIs.
    """
    
    @staticmethod
    def dispatch_alert(
        recipient_name: str,
        recipient_contact: str,
        channel: str,  # 'SMS', 'Email', 'Push'
        subject: str,
        content: str,
        incident_id: int
    ) -> Dict:
        dispatch_id = f"MOCK-NOTIF-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Simulated delivery status (99% success)
        status = "Delivered"
        
        log_entry = {
            "dispatch_id": dispatch_id,
            "incident_id": incident_id,
            "recipient_name": recipient_name,
            "recipient_contact": recipient_contact,
            "channel": channel,
            "subject": subject,
            "content": content,
            "status": status,
            "timestamp": timestamp
        }
        return log_entry

    @classmethod
    def broadcast_incident_teams(cls, incident: Dict, responders: List[Dict]) -> List[Dict]:
        """Broadcasts emergency alert to matching on-duty responders."""
        dispatched_logs = []
        for responder in responders:
            if responder.get("status") == "Available":
                # Push Notification
                push_entry = cls.dispatch_alert(
                    recipient_name=responder.get("name", "Campus Responder"),
                    recipient_contact=f"DEVICE-{responder.get('id', 1)}",
                    channel="Push",
                    subject=f"CRITICAL DISPATCH: {incident.get('incident_type')} [Sev {incident.get('severity_score')}/10]",
                    content=incident.get('summary', 'Emergency response requested'),
                    incident_id=incident.get('id', 0)
                )
                dispatched_logs.append(push_entry)
                
                # SMS Backup
                sms_entry = cls.dispatch_alert(
                    recipient_name=responder.get("name", "Campus Responder"),
                    recipient_contact=responder.get("phone", "+91-9876543210"),
                    channel="SMS",
                    subject="Campus Emergency SMS",
                    content=f"ALERT: {incident.get('incident_type')} at {incident.get('location_name')}. ETA: {responder.get('eta_minutes', 3)}m. Open responder portal immediately.",
                    incident_id=incident.get('id', 0)
                )
                dispatched_logs.append(sms_entry)
        return dispatched_logs
