import React, { useState, useMemo } from 'react';
import { Incident, IncidentStatus, IncidentType, NotificationLog, Responder, SeverityLevel } from '../types';
import { rankRespondersProximity } from '../lib/orchestration';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Compass,
  ArrowRight,
  Send,
  Users,
  Bell,
  Cpu,
  FileText,
  MapPin,
  X,
  ChevronDown,
} from 'lucide-react';

interface AdminDashboardProps {
  incidents: Incident[];
  responders: Responder[];
  notifications: NotificationLog[];
  onAssignResponder: (incidentId: number, responderId: number, note?: string) => void;
  onUpdateStatus: (incidentId: number, newStatus: IncidentStatus, adminNote?: string) => void;
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  incidents,
  responders,
  notifications,
  onAssignResponder,
  onUpdateStatus,
  selectedIncident,
  onSelectIncident,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'responders' | 'notifications'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Detail modal state
  const [assignNote, setAssignNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newStatusInput, setNewStatusInput] = useState<IncidentStatus>('Pending');

  // Sync modal when selectedIncident changes
  React.useEffect(() => {
    if (selectedIncident) {
      setNewStatusInput(selectedIncident.status);
    }
  }, [selectedIncident]);

  // Statistics
  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => i.severityLevel === 'High').length;
  const activeQueueCount = incidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Dismissed').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;
  const avgSeverityScore = totalIncidents > 0 ? (incidents.reduce((acc, i) => acc + i.severityScore, 0) / totalIncidents).toFixed(1) : '0.0';

  // Filtered and sorted incidents (Severity score 0-10 descending is PRIMARY sort)
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        if (severityFilter !== 'all' && inc.severityLevel !== severityFilter) return false;
        if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
        if (typeFilter !== 'all' && inc.incidentType !== typeFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMsg = inc.message.toLowerCase().includes(q);
          const matchLoc = inc.locationName.toLowerCase().includes(q);
          const matchRep = inc.reporterName.toLowerCase().includes(q);
          if (!matchMsg && !matchLoc && !matchRep) return false;
        }
        return true;
      })
      .sort((a, b) => b.severityScore - a.severityScore);
  }, [incidents, severityFilter, statusFilter, typeFilter, searchQuery]);

  // Ranked responders for the selected incident using Haversine algorithm
  const rankedRespondersForDetail = useMemo(() => {
    if (!selectedIncident) return [];
    return rankRespondersProximity(
      selectedIncident.latitude,
      selectedIncident.longitude,
      selectedIncident.incidentType,
      responders
    );
  }, [selectedIncident, responders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold font-mono">
              Emergency Command Console
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Triage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Central Dispatch & Orchestration
          </h1>
        </div>

        {/* View Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'queue' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Incident Queue ({filteredIncidents.length})
          </button>
          <button
            onClick={() => setActiveTab('responders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'responders' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tactical Directory ({responders.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'notifications' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs ({notifications.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Alerts</div>
          <div className="text-2xl font-bold font-mono text-white">{totalIncidents}</div>
          <div className="text-xs text-slate-500 font-mono">Historical volume</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-900/40 space-y-1">
          <div className="text-xs font-mono text-rose-400 uppercase tracking-wider">Critical (High)</div>
          <div className="text-2xl font-bold font-mono text-rose-400">{criticalCount}</div>
          <div className="text-xs text-rose-500/70 font-mono">Severity &ge; 7.0 / 10</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/40 space-y-1">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">Active in Queue</div>
          <div className="text-2xl font-bold font-mono text-amber-400">{activeQueueCount}</div>
          <div className="text-xs text-amber-500/70 font-mono">Pending / In-Transit</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/40 space-y-1">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Resolved Safely</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{resolvedCount}</div>
          <div className="text-xs text-emerald-500/70 font-mono">Avg Score: {avgSeverityScore}/10</div>
        </div>
      </div>

      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Multi-criteria Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
            <div className="relative flex-grow min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search emergency keyword, student or zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                aria-label="Filter by Severity"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Severity: All</option>
                <option value="High">High (&ge; 7.0)</option>
                <option value="Medium">Medium (4.0 - 6.9)</option>
                <option value="Low">Low (&lt; 4.0)</option>
              </select>

              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Status: All</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                aria-label="Filter by Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Type: All</option>
                <option value="Medical">Medical</option>
                <option value="Fire">Fire</option>
                <option value="Violence">Violence</option>
                <option value="Hazard">Hazard</option>
                <option value="Structural">Structural</option>
                <option value="General">General</option>
              </select>

              {(searchQuery || severityFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSeverityFilter('all');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-mono"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Incidents Table (Sorted by Severity Score 0-10 descending) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-24">Severity</th>
                    <th className="py-3 px-4">Emergency & Location</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4">AI Dispatch Summary</th>
                    <th className="py-3 px-4">Tactical Unit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredIncidents.length > 0 ? (
                    filteredIncidents.map((inc) => (
                      <tr
                        key={inc.id}
                        onClick={() => onSelectIncident(inc)}
                        className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                          inc.severityLevel === 'High' && inc.status !== 'Resolved'
                            ? 'bg-rose-950/15'
                            : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono">
                          <div
                            className={`font-bold text-center py-1 px-2 rounded font-mono text-xs ${
                              inc.severityLevel === 'High'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : inc.severityLevel === 'Medium'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {inc.severityScore.toFixed(1)} / 10
                            <div className="text-[10px] uppercase font-bold tracking-tight">
                              {inc.severityLevel}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200 text-sm">
                            #{inc.id} · {inc.incidentType}
                          </div>
                          <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{inc.locationName}</span>
                          </div>
                          <div className="text-slate-500 font-mono text-[11px]">
                            {inc.peopleCount} person(s) at risk
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <div>{inc.reporterName}</div>
                          <div className="text-slate-500 text-[11px]">{inc.reporterPhone}</div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs font-mono text-slate-300">
                          <div className="line-clamp-2 text-xs">
                            {inc.summary || inc.message}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            ML: {inc.mlLevel} ({Math.round((inc.mlConfidence || 0.85) * 100)}%)
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {inc.assignedResponderName ? (
                            <div>
                              <span className="font-semibold text-slate-200">
                                {inc.assignedResponderName}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {inc.assignedResponderSpecialty}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 font-mono text-xs">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              inc.status === 'Resolved'
                                ? 'bg-slate-800 text-slate-400'
                                : inc.status === 'In-Progress'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-800'
                                : inc.status === 'Assigned'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-800'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-800 animate-pulse'
                            }`}
                          >
                            {inc.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIncident(inc);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-500">
                        No incidents match your current filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Responders Directory Tab */}
      {activeTab === 'responders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {responders.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{r.name}</h3>
                  <div className="text-xs text-rose-400 font-mono">{r.specialization} Unit</div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono ${
                    r.status === 'Available'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-800'
                      : r.status === 'On Duty'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-800'
                      : r.status === 'Busy'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-800'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 font-mono border-t border-slate-800 pt-3">
                <div>Contact: {r.phone}</div>
                <div>Vehicle: {r.vehicle}</div>
                <div>
                  GPS: {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                </div>
                <div className="text-slate-300 font-semibold pt-1">
                  Active Dispatches: {r.assignedIncidentsCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Audit Log Tab */}
      {activeTab === 'notifications' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Dispatch ID</th>
                  <th className="py-3 px-4">Incident</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Dispatched Content</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-cyan-400">{n.dispatchId}</td>
                    <td className="py-3 px-4 font-bold text-white">#{n.incidentId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {n.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{n.recipientName}</td>
                    <td className="py-3 px-4 text-slate-400">{n.recipientContact}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">{n.content}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{n.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{n.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incident Detail & Triage Drawer / Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => onSelectIncident(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-2">
              <span className="text-rose-400 font-bold uppercase">Incident #{selectedIncident.id}</span>
              <span className="text-slate-600">·</span>
              <span className="text-white font-semibold">{selectedIncident.incidentType}</span>
              <span className="text-slate-600">·</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  selectedIncident.severityLevel === 'High'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : selectedIncident.severityLevel === 'Medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                Severity: {selectedIncident.severityScore.toFixed(1)} / 10 ({selectedIncident.severityLevel})
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Emergency Dossier #{selectedIncident.id}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Reported by {selectedIncident.reporterName} ({selectedIncident.reporterPhone}) · {selectedIncident.createdAt}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Left Column: AI Diagnostics & Location */}
              <div className="space-y-4">
                {/* AI Breakdown Card */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" />
                      <span>AI Orchestration Diagnostics</span>
                    </span>
                    <span className="text-xs font-mono text-cyan-400">Hybrid Pipeline</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">COMBINED</div>
                      <div className="text-base font-bold text-rose-400">
                        {selectedIncident.severityScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">RULE SCORE</div>
                      <div className="text-base font-bold text-slate-200">
                        {selectedIncident.ruleScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">ML LEVEL</div>
                      <div className="text-base font-bold text-amber-400">
                        {selectedIncident.mlLevel}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">
                      NLP Extractive Summary:
                    </div>
                    <div>"{selectedIncident.summary}"</div>
                  </div>

                  {/* Triggered Rules */}
                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-300">
                      Triggered Rules & Keyword Hits:
                    </div>
                    {selectedIncident.triggeredRules.map((r, i) => (
                      <div key={i} className="text-slate-300 font-mono text-[11px]">
                        &bull; {r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location & Casualties */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>Location & Exposure</span>
                  </div>
                  <div className="font-semibold text-slate-100 text-sm">
                    {selectedIncident.locationName}
                  </div>
                  <div className="text-slate-400 font-mono">
                    GPS Coordinates: {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}
                  </div>
                  <div className="text-rose-400 font-mono font-bold pt-1">
                    {selectedIncident.peopleCount} Person(s) Affected / Trapped
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 italic">
                    "{selectedIncident.message}"
                  </div>
                </div>
              </div>

              {/* Right Column: Haversine Dispatch & Workflow Update */}
              <div className="space-y-4">
                {/* Haversine Proximity Dispatcher */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                      <Compass className="w-4 h-4" />
                      <span>Haversine Proximity Dispatcher</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">Great-Circle Math</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {rankedRespondersForDetail.map((resp) => (
                      <div
                        key={resp.id}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                          selectedIncident.assignedResponderId === resp.id
                            ? 'bg-rose-950/40 border-rose-600'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span>{resp.name}</span>
                            <span className="text-[10px] px-1.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {resp.specialization}
                            </span>
                          </div>
                          <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                            {resp.distanceMeters}m away · ETA: ~{resp.etaMinutes} min
                          </div>
                          {resp.isSpecialtyMatch && (
                            <div className="text-[10px] text-emerald-400 font-mono">
                              &bull; Recommended specialty match
                            </div>
                          )}
                        </div>

                        <div>
                          {selectedIncident.assignedResponderId === resp.id ? (
                            <span className="text-rose-400 font-bold font-mono text-xs">
                              Assigned
                            </span>
                          ) : (
                            <button
                              onClick={() => onAssignResponder(selectedIncident.id, resp.id, assignNote)}
                              disabled={resp.status === 'Off Duty'}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors"
                            >
                              Dispatch Unit
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Optional dispatch instruction note for responder..."
                      value={assignNote}
                      onChange={(e) => setAssignNote(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status Update & Admin Notes Panel */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                    Update Workflow Status
                  </div>

                  <div className="flex gap-2">
                    <select
                      aria-label="Workflow Status Selection"
                      value={newStatusInput}
                      onChange={(e) => setNewStatusInput(e.target.value as IncidentStatus)}
                      className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Dismissed">Dismissed</option>
                    </select>

                    <button
                      onClick={() => onUpdateStatus(selectedIncident.id, newStatusInput, statusNote)}
                      className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold"
                    >
                      Save Status
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Admin triage findings or resolution log..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                  />

                  {selectedIncident.adminNotes && (
                    <div className="p-2 rounded bg-slate-900 text-xs font-mono text-slate-400">
                      <span className="font-bold text-slate-300">Admin Log:</span> {selectedIncident.adminNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
