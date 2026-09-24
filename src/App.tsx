import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { ResponderPortal } from './components/ResponderPortal';
import { AIPlayground } from './components/AIPlayground';
import { ProjectDocs } from './components/ProjectDocs';
import { CodeBrowser } from './components/CodeBrowser';

import {
  DEMO_USERS,
  INITIAL_INCIDENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RESPONDERS,
} from './data/initialData';
import {
  Incident,
  IncidentStatus,
  NotificationLog,
  Responder,
  ResponderStatus,
  User,
} from './types';
import { analyzeEmergencyIncident, rankRespondersProximity } from './lib/orchestration';
import { downloadPythonProjectZip } from './lib/projectZip';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]); // Default to Admin
  const [activeTab, setActiveTab] = useState<string>('admin');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [responders, setResponders] = useState<Responder[]>(INITIAL_RESPONDERS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Submit emergency incident from Student Portal
  const handleSubmitIncident = (newIncData: Partial<Incident>) => {
    const incType = newIncData.incidentType || 'General';
    const message = newIncData.message || '';
    const locName = newIncData.locationName || 'Campus Ground';
    const people = newIncData.peopleCount || 1;
    const lat = newIncData.latitude || 12.9716;
    const lon = newIncData.longitude || 77.5946;

    // AI Dual-Layer Analysis
    const ai = analyzeEmergencyIncident(incType, message, locName, people);

    const newId = incidents.length > 0 ? Math.max(...incidents.map((i) => i.id)) + 1 : 101;

    // Nearest responders ranking via Haversine formula
    const ranked = rankRespondersProximity(lat, lon, incType, responders);
    const topResponder = ranked[0];

    // Mock notification dispatch to available responder
    const newNotifications: NotificationLog[] = [];
    if (topResponder && topResponder.status === 'Available') {
      newNotifications.push({
        id: `n-${Date.now()}-1`,
        incidentId: newId,
        dispatchId: `MOCK-NOTIF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        recipientName: topResponder.name,
        recipientContact: `DEVICE-${topResponder.id}`,
        channel: 'Push',
        subject: `CRITICAL DISPATCH: ${incType} [Sev ${ai.finalSeverityScore.toFixed(1)}/10]`,
        content: ai.summary,
        status: 'Delivered',
        timestamp: 'Just now',
      });

      newNotifications.push({
        id: `n-${Date.now()}-2`,
        incidentId: newId,
        dispatchId: `MOCK-NOTIF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        recipientName: topResponder.name,
        recipientContact: topResponder.phone,
        channel: 'SMS',
        subject: 'Campus Emergency SMS',
        content: `ALERT: ${incType} at ${locName}. ETA: ~${topResponder.etaMinutes}m. Check responder console.`,
        status: 'Delivered',
        timestamp: 'Just now',
      });
    }

    const createdIncident: Incident = {
      id: newId,
      studentId: newIncData.studentId || currentUser.id,
      reporterName: newIncData.reporterName || currentUser.name,
      reporterPhone: newIncData.reporterPhone || currentUser.phone,
      incidentType: incType,
      message,
      locationName: locName,
      latitude: lat,
      longitude: lon,
      peopleCount: people,
      severityScore: ai.finalSeverityScore,
      severityLevel: ai.finalSeverityLevel,
      summary: ai.summary,
      ruleScore: ai.ruleScore,
      mlLevel: ai.mlLevel,
      mlConfidence: ai.mlConfidence,
      triggeredRules: ai.triggeredRules,
      status: 'Pending',
      createdAt: 'Just now',
      updates: [
        {
          id: `u-${Date.now()}`,
          timestamp: 'Just now',
          author: currentUser.name,
          status: 'Pending',
          notes: `Emergency SOS transmitted. AI evaluated severity at ${ai.finalSeverityScore}/10 (${ai.finalSeverityLevel}).`,
        },
      ],
    };

    setIncidents((prev) => [createdIncident, ...prev]);
    setNotifications((prev) => [...newNotifications, ...prev]);
    setSelectedIncident(createdIncident);
  };

  // Assign responder to incident
  const handleAssignResponder = (incidentId: number, responderId: number, note?: string) => {
    const targetResponder = responders.find((r) => r.id === responderId);
    if (!targetResponder) return;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const updatedInc = {
            ...inc,
            status: 'Assigned' as IncidentStatus,
            assignedResponderId: responderId,
            assignedResponderName: targetResponder.name,
            assignedResponderSpecialty: targetResponder.specialization,
            adminNotes: note ? `${inc.adminNotes || ''}\n[Assigned]: ${note}`.trim() : inc.adminNotes,
            updates: [
              ...inc.updates,
              {
                id: `u-${Date.now()}`,
                timestamp: 'Just now',
                author: currentUser.name,
                status: 'Assigned',
                notes: `Dispatched ${targetResponder.name} (${targetResponder.specialization}). ${note || ''}`,
              },
            ],
          };
          if (selectedIncident?.id === incidentId) {
            setSelectedIncident(updatedInc);
          }
          return updatedInc;
        }
        return inc;
      })
    );

    // Update responder status to Busy
    setResponders((prev) =>
      prev.map((r) =>
        r.id === responderId ? { ...r, status: 'Busy', assignedIncidentsCount: r.assignedIncidentsCount + 1 } : r
      )
    );

    // Create dispatch notification log
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        incidentId,
        dispatchId: `MOCK-NOTIF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        recipientName: targetResponder.name,
        recipientContact: targetResponder.phone,
        channel: 'SMS',
        subject: 'DIRECT ASSIGNMENT ALERT',
        content: `Assigned to Incident #${incidentId}. Instructions: ${note || 'Immediate response requested.'}`,
        status: 'Delivered',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  // Update status from Admin Command Center
  const handleUpdateStatus = (incidentId: number, newStatus: IncidentStatus, adminNote?: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const updated = {
            ...inc,
            status: newStatus,
            resolvedAt: newStatus === 'Resolved' ? 'Just now' : inc.resolvedAt,
            adminNotes: adminNote ? `${inc.adminNotes || ''}\n[Status ${newStatus}]: ${adminNote}`.trim() : inc.adminNotes,
            updates: [
              ...inc.updates,
              {
                id: `u-${Date.now()}`,
                timestamp: 'Just now',
                author: currentUser.name,
                status: newStatus,
                notes: `Status changed to ${newStatus}. ${adminNote || ''}`,
              },
            ],
          };
          if (selectedIncident?.id === incidentId) {
            setSelectedIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );

    // If resolved, make the assigned responder available
    if (newStatus === 'Resolved') {
      const targetInc = incidents.find((i) => i.id === incidentId);
      if (targetInc?.assignedResponderId) {
        setResponders((prev) =>
          prev.map((r) =>
            r.id === targetInc.assignedResponderId
              ? { ...r, status: 'Available', assignedIncidentsCount: Math.max(0, r.assignedIncidentsCount - 1) }
              : r
          )
        );
      }
    }
  };

  // Update responder status and coordinates
  const handleUpdateResponderStatus = (
    responderId: number,
    status: ResponderStatus,
    lat?: number,
    lon?: number
  ) => {
    setResponders((prev) =>
      prev.map((r) =>
        r.id === responderId
          ? {
              ...r,
              status,
              latitude: lat !== undefined ? lat : r.latitude,
              longitude: lon !== undefined ? lon : r.longitude,
            }
          : r
      )
    );
  };

  // Triggered by responder in ResponderPortal
  const handleResponderCaseAction = (incidentId: number, status: IncidentStatus, notes: string) => {
    handleUpdateStatus(incidentId, status, notes);
  };

  // Download complete Python project as ZIP
  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadPythonProjectZip();
    } catch (e) {
      console.error('Error generating project zip:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Universal Top Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        usersList={DEMO_USERS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloadingZip}
      />

      {/* Main View Port */}
      <main className="flex-grow">
        {activeTab === 'student' && (
          <StudentPortal
            currentUser={currentUser}
            incidents={incidents}
            onSubmitIncident={handleSubmitIncident}
            onSelectIncident={setSelectedIncident}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            incidents={incidents}
            responders={responders}
            notifications={notifications}
            onAssignResponder={handleAssignResponder}
            onUpdateStatus={handleUpdateStatus}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />
        )}

        {activeTab === 'responder' && (
          <ResponderPortal
            currentUser={currentUser}
            responders={responders}
            incidents={incidents}
            onUpdateResponderStatus={handleUpdateResponderStatus}
            onUpdateIncidentStatus={handleResponderCaseAction}
            onSelectIncident={setSelectedIncident}
          />
        )}

        {activeTab === 'playground' && <AIPlayground responders={responders} />}

        {activeTab === 'docs' && <ProjectDocs />}

        {activeTab === 'code' && (
          <CodeBrowser onDownloadZip={handleDownloadZip} isDownloading={isDownloadingZip} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">
            Context-Aware AI Campus Emergency Orchestration System
          </span>
          <span>·</span>
          <span>BCA Final-Year Capstone Project</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <button onClick={() => setActiveTab('code')} className="hover:text-rose-400 transition-colors">
            Source Files
          </button>
          <span>·</span>
          <button onClick={() => setActiveTab('docs')} className="hover:text-rose-400 transition-colors">
            Viva Voce (30+ Q&A)
          </button>
          <span>·</span>
          <button onClick={handleDownloadZip} className="text-rose-400 hover:text-rose-300 font-bold transition-colors">
            Download Python Project (.ZIP)
          </button>
        </div>
      </footer>
    </div>
  );
}
