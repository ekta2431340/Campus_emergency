import React, { useState, useEffect } from 'react';
import { Incident, IncidentType, User } from '../types';
import { CAMPUS_LOCATIONS } from '../data/initialData';
import { analyzeEmergencyIncident } from '../lib/orchestration';
import {
  AlertTriangle,
  Flame,
  HeartPulse,
  Shield,
  Biohazard,
  Building,
  HelpCircle,
  MapPin,
  Crosshair,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  PhoneCall,
  Sparkles,
  Send,
  X,
} from 'lucide-react';

interface StudentPortalProps {
  currentUser: User;
  incidents: Incident[];
  onSubmitIncident: (newIncident: Partial<Incident>) => void;
  onSelectIncident: (incident: Incident) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentUser,
  incidents,
  onSubmitIncident,
  onSelectIncident,
}) => {
  const [showSosModal, setShowSosModal] = useState(false);
  const [incidentType, setIncidentType] = useState<IncidentType>('Medical');
  const [locationName, setLocationName] = useState('Main Academic Block (CS & IT Wing)');
  const [latitude, setLatitude] = useState(12.9720);
  const [longitude, setLongitude] = useState(77.5940);
  const [peopleCount, setPeopleCount] = useState(1);
  const [message, setMessage] = useState('');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [gpsMessage, setGpsMessage] = useState('');

  // Live client-side AI analysis forecast
  const [livePreview, setLivePreview] = useState(() =>
    analyzeEmergencyIncident('Medical', '', 'Main Academic Block (CS & IT Wing)', 1)
  );

  useEffect(() => {
    const preview = analyzeEmergencyIncident(incidentType, message, locationName, peopleCount);
    setLivePreview(preview);
  }, [incidentType, message, locationName, peopleCount]);

  const handleAcquireGps = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('locating');
      setGpsMessage('Detecting device GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lon = parseFloat(position.coords.longitude.toFixed(6));
          setLatitude(lat);
          setLongitude(lon);
          setGpsStatus('success');
          setGpsMessage(`Acquired exact GPS: ${lat}, ${lon}`);
        },
        (error) => {
          setGpsStatus('error');
          setGpsMessage('GPS permission denied or indoor signal weak. Campus landmark coordinates applied.');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setGpsStatus('error');
      setGpsMessage('Geolocation is not supported by your browser. Please pick a campus landmark.');
    }
  };

  const handleSelectLandmark = (landmarkName: string) => {
    setLocationName(landmarkName);
    const loc = CAMPUS_LOCATIONS.find((l) => l.name === landmarkName);
    if (loc) {
      setLatitude(loc.lat);
      setLongitude(loc.lon);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSubmitIncident({
      incidentType,
      locationName,
      latitude,
      longitude,
      peopleCount,
      message,
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone,
      studentId: currentUser.id,
    });

    setMessage('');
    setShowSosModal(false);
  };

  const myIncidents = incidents.filter((i) => i.studentId === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold font-mono">
              Student Safety Portal
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">ID: {currentUser.campusId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Instant AI-triaged campus emergency broadcast and responder dispatch.
          </p>
        </div>

        <button
          onClick={() => setShowSosModal(true)}
          className="self-start sm:self-auto px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold shadow-lg shadow-rose-900/30 flex items-center gap-2 transform active:scale-95 transition-all text-sm uppercase tracking-wider animate-pulse-subtle"
        >
          <Flame className="w-5 h-5 text-white" />
          <span>Broadcast Emergency SOS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Big SOS Action Card & Campus Hotlines */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border border-rose-800/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Direct Emergency Transmitter
            </div>
            <h2 className="text-xl font-bold text-white mt-3">Witnessing or in an Emergency?</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Submitting an alert triggers immediate dual-layer AI analysis: critical rule detection + TF-IDF ML severity scoring (0–10) and Haversine nearest responder routing.
            </p>

            <button
              onClick={() => setShowSosModal(true)}
              className="w-full mt-5 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-center flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Open Emergency SOS Form</span>
            </button>
          </div>

          {/* Direct Emergency Contacts */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                Campus Rapid Hotlines
              </h3>
              <span className="text-xs text-emerald-400 font-mono">24/7 Active</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Campus Health & Ambulance</div>
                  <div className="text-slate-400 font-mono">Ext. 1001 / Unit #3</div>
                </div>
                <a
                  href="tel:080-22961001"
                  className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono hover:bg-rose-500/30 transition-colors"
                >
                  080-22961001
                </a>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Main Gate Security Dispatch</div>
                  <div className="text-slate-400 font-mono">Ext. 1002 / Patrol Control</div>
                </div>
                <a
                  href="tel:080-22961002"
                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono hover:bg-amber-500/30 transition-colors"
                >
                  080-22961002
                </a>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Fire & Chemical Hazmat Desk</div>
                  <div className="text-slate-400 font-mono">Ext. 1003 / Science Block</div>
                </div>
                <a
                  href="tel:080-22961003"
                  className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono hover:bg-cyan-500/30 transition-colors"
                >
                  080-22961003
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: My Reported Incidents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">My Emergency Reports</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Track real-time severity scoring, responder dispatch, and on-scene updates.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                {myIncidents.length} Records
              </span>
            </div>

            {myIncidents.length > 0 ? (
              <div className="space-y-3">
                {myIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-rose-400 font-bold">#{inc.id}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-semibold text-white text-sm">{inc.incidentType}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-slate-400">{inc.locationName}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            inc.severityLevel === 'High'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : inc.severityLevel === 'Medium'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {inc.severityScore}/10 {inc.severityLevel}
                        </span>

                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            inc.status === 'Resolved'
                              ? 'bg-slate-700 text-slate-300'
                              : inc.status === 'In-Progress'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : inc.status === 'Assigned'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {inc.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-mono line-clamp-2">
                      {inc.summary || inc.message}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/40">
                      <span>Reported: {inc.createdAt}</span>
                      <span className="flex items-center gap-1 text-rose-400 group-hover:translate-x-0.5 transition-transform">
                        <span>View Live Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-sm">No emergency cases reported under your account.</p>
                <p className="text-xs text-slate-600">
                  Campus security lines are nominal. Tap the SOS button in case of any danger.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOS Incident Submission Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
            <button
              onClick={() => setShowSosModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-500 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Emergency Incident Transmitter
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Submit Campus SOS</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your message will be parsed by the rule-based heuristics & TF-IDF model.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  1. Emergency Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Medical', label: 'Medical', icon: HeartPulse },
                    { id: 'Fire', label: 'Fire / Smoke', icon: Flame },
                    { id: 'Violence', label: 'Threat / Fight', icon: Shield },
                    { id: 'Hazard', label: 'Hazard / Gas', icon: Biohazard },
                    { id: 'Structural', label: 'Lift / Trapped', icon: Building },
                    { id: 'General', label: 'General SOS', icon: HelpCircle },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = incidentType === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setIncidentType(cat.id as IncidentType)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500 text-white font-bold shadow-md shadow-rose-950'
                            : 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location with GPS Geolocation & Landmark selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    2. Campus Location
                  </label>
                  <button
                    type="button"
                    onClick={handleAcquireGps}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Acquire My Device GPS</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <select
                    value={locationName}
                    onChange={(e) => handleSelectLandmark(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Coords: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                  </div>

                  {gpsStatus !== 'idle' && (
                    <div
                      className={`text-xs font-mono p-2 rounded ${
                        gpsStatus === 'success'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                          : gpsStatus === 'locating'
                          ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800 animate-pulse'
                          : 'bg-amber-950/40 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {gpsMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* People count */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  3. People in Immediate Danger or Affected
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPeopleCount((p) => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-lg font-bold flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-mono font-bold text-lg text-white">
                    {peopleCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPeopleCount((p) => p + 1)}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-lg font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-400">
                    (Multi-casualty multiplier triggers if &ge; 5)
                  </span>
                </div>
              </div>

              {/* Message text area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  4. Situation Description
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Student collapsed in chemistry lab, unconscious and not breathing, severe smoke from beaker..."
                  rows={3}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Live AI Severity Forecast Box */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <span>Real-time Severity Forecast</span>
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      livePreview.finalSeverityLevel === 'High'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : livePreview.finalSeverityLevel === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    Score: {livePreview.finalSeverityScore.toFixed(1)} / 10 · {livePreview.finalSeverityLevel}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {livePreview.triggeredRules.length > 0 ? (
                    <div className="space-y-0.5">
                      {livePreview.triggeredRules.slice(0, 2).map((r, i) => (
                        <div key={i} className="text-slate-300">
                          &bull; {r}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>Type incident details above to evaluate keywords and ML probability...</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold uppercase tracking-wider text-sm shadow-lg shadow-rose-950 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Emergency SOS Immediately</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
