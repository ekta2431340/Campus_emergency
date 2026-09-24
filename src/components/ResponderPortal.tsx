import React, { useState } from 'react';
import { Incident, IncidentStatus, Responder, ResponderStatus, User } from '../types';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Send,
  AlertTriangle,
  Radio,
  FileEdit,
  Truck,
} from 'lucide-react';

interface ResponderPortalProps {
  currentUser: User;
  responders: Responder[];
  incidents: Incident[];
  onUpdateResponderStatus: (responderId: number, status: ResponderStatus, lat?: number, lon?: number) => void;
  onUpdateIncidentStatus: (incidentId: number, status: IncidentStatus, notes: string) => void;
  onSelectIncident: (incident: Incident) => void;
}

export const ResponderPortal: React.FC<ResponderPortalProps> = ({
  currentUser,
  responders,
  incidents,
  onUpdateResponderStatus,
  onUpdateIncidentStatus,
  onSelectIncident,
}) => {
  // Find current responder profile (fallback to first responder if admin testing)
  const currentResponder = responders.find((r) => r.userId === currentUser.id) || responders[0];

  const [fieldNote, setFieldNote] = useState<Record<number, string>>({});
  const [gpsLat, setGpsLat] = useState(currentResponder ? currentResponder.latitude : 12.9730);
  const [gpsLon, setGpsLon] = useState(currentResponder ? currentResponder.longitude : 77.5950);

  const assignedCases = incidents.filter(
    (i) => i.assignedResponderId === currentResponder?.id
  );

  const criticalBroadcasts = incidents
    .filter((i) => i.status !== 'Resolved' && i.severityLevel === 'High')
    .slice(0, 3);

  const handleCaseAction = (incidentId: number, status: IncidentStatus) => {
    const note = fieldNote[incidentId] || '';
    onUpdateIncidentStatus(incidentId, status, note);
    setFieldNote((prev) => ({ ...prev, [incidentId]: '' }));
  };

  if (!currentResponder) {
    return <div className="p-8 text-center text-slate-400">No tactical profile found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold font-mono">
              Tactical Responder Portal
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">{currentResponder.specialization} Squad</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Unit Console: {currentResponder.name}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Vehicle: {currentResponder.vehicle} · Campus ID: {currentUser.campusId}
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">Current Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
              currentResponder.status === 'Available'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                : currentResponder.status === 'On Duty'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : currentResponder.status === 'Busy'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            ● {currentResponder.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Duty Readiness & GPS */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Duty Readiness Control
              </h2>
            </div>

            {/* Toggle Status Buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Select Readiness State:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Available', 'On Duty', 'Busy', 'Off Duty'] as ResponderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateResponderStatus(currentResponder.id, st, gpsLat, gpsLon)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all border ${
                      currentResponder.status === st
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinate Telemetry */}
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="font-bold text-slate-300 font-mono flex items-center justify-between">
                <span>Tactical GPS Position</span>
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={gpsLat}
                    onChange={(e) => setGpsLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={gpsLon}
                    onChange={(e) => setGpsLon(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 font-mono text-slate-200"
                  />
                </div>
              </div>
              <button
                onClick={() => onUpdateResponderStatus(currentResponder.id, currentResponder.status, gpsLat, gpsLon)}
                className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-semibold transition-colors"
              >
                Sync Coordinate Telemetry
              </button>
            </div>
          </div>

          {/* Active Critical Campus Broadcasts */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Radio className="w-4 h-4 animate-pulse" />
                Active Critical Broadcasts
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Campus-Wide</span>
            </div>

            <div className="space-y-2.5">
              {criticalBroadcasts.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectIncident(b)}
                  className="p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-rose-900/30 transition-all cursor-pointer space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">#{b.id} · {b.incidentType}</span>
                    <span className="text-rose-400 font-mono font-bold text-[11px]">{b.severityScore}/10 High</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{b.locationName}</div>
                  <div className="text-slate-300 font-mono text-[11px] line-clamp-1 italic">
                    "{b.summary || b.message}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Assigned Cases Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Assigned Tactical Missions</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Update triage phase and transmit field observations to Central Command.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400">
                {assignedCases.length} Assigned
              </span>
            </div>

            {assignedCases.length > 0 ? (
              <div className="space-y-4">
                {assignedCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-rose-400 font-bold">#{c.id}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-bold text-white text-sm">{c.incidentType}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-slate-300">{c.locationName}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                          Sev: {c.severityScore}/10 ({c.severityLevel})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200">
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                        Dispatch Briefing:
                      </div>
                      <div>{c.summary || c.message}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                      <div>GPS: {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</div>
                      <div className="text-rose-400 font-bold">
                        Affected: {c.peopleCount} person(s)
                      </div>
                    </div>

                    {/* Responder Action Controls */}
                    {c.status !== 'Resolved' ? (
                      <div className="space-y-2 pt-3 border-t border-slate-700/60">
                        <input
                          type="text"
                          placeholder="Field observation notes (e.g. 'Arrived on scene, patient conscious and stabilized')..."
                          value={fieldNote[c.id] || ''}
                          onChange={(e) =>
                            setFieldNote((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        />

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCaseAction(c.id, 'In-Progress')}
                            className="flex-grow py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Mark On Scene / In-Progress</span>
                          </button>

                          <button
                            onClick={() => handleCaseAction(c.id, 'Resolved')}
                            className="flex-grow py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Mission Resolved</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mission safely resolved and logged to audit trail.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-sm">No active emergencies assigned to your unit.</p>
                <p className="text-xs text-slate-600">
                  Stay on standby. Priority dispatches will alert you immediately.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
