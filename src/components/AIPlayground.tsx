import React, { useState } from 'react';
import { IncidentType, Responder } from '../types';
import { analyzeEmergencyIncident, rankRespondersProximity } from '../lib/orchestration';
import { Cpu, Sparkles, Compass, CheckCircle2, AlertTriangle, ArrowRight, Play } from 'lucide-react';

interface AIPlaygroundProps {
  responders: Responder[];
}

const PRESET_SCENARIOS = [
  {
    title: 'Cardiac Arrest in CS Lab',
    type: 'Medical' as IncidentType,
    people: 1,
    location: 'Main Academic Block (CS & IT Wing)',
    lat: 12.9720,
    lon: 77.5940,
    text: 'Student collapsed in CS Lab 3 unconscious not breathing need defibrillator urgently!',
  },
  {
    title: 'Chemistry Lab Explosion & Smoke',
    type: 'Fire' as IncidentType,
    people: 15,
    location: 'Science Complex & Chemistry Labs',
    lat: 12.9735,
    lon: 77.5955,
    text: 'Thick black smoke and flames coming from Chemistry Lab 204 chemicals exploding reagent bottles bursting.',
  },
  {
    title: 'Lift Entrapment in Hostel B',
    type: 'Structural' as IncidentType,
    people: 6,
    location: 'Hostel Block B (Girls Campus)',
    lat: 12.9690,
    lon: 77.5960,
    text: 'Elevator lift stuck between 3rd and 4th floor with 6 students trapped inside lights flickering panic attack.',
  },
  {
    title: 'Lost Identity Card (Low Priority)',
    type: 'General' as IncidentType,
    people: 1,
    location: 'Central Library & Digital Reading Hall',
    lat: 12.9712,
    lon: 77.5932,
    text: 'Lost my student ID card and wallet near the second floor photocopier desk.',
  },
];

export const AIPlayground: React.FC<AIPlaygroundProps> = ({ responders }) => {
  const [incidentType, setIncidentType] = useState<IncidentType>('Medical');
  const [peopleCount, setPeopleCount] = useState(1);
  const [locationName, setLocationName] = useState('Science Complex & Chemistry Labs');
  const [lat, setLat] = useState(12.9735);
  const [lon, setLon] = useState(77.5955);
  const [message, setMessage] = useState(
    'Student collapsed in CS Lab 3 unconscious not breathing need defibrillator urgently!'
  );

  const result = analyzeEmergencyIncident(incidentType, message, locationName, peopleCount);
  const rankedResponders = rankRespondersProximity(lat, lon, incidentType, responders);

  const applyPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setIncidentType(preset.type);
    setPeopleCount(preset.people);
    setLocationName(preset.location);
    setLat(preset.lat);
    setLon(preset.lon);
    setMessage(preset.text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold font-mono">
            Interactive AI Laboratory
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">Triage Model Inspector</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Dual-Layer AI Severity & Dispatch Simulation
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Inspect keyword rule heuristics, TF-IDF probability outputs, and Haversine distance computations in real time.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Quick-Load Scenario Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 text-cyan-400" />
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input Sandbox */}
        <div className="space-y-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Incident Telemetry Input</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Incident Category</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
              >
                <option value="Medical">Medical</option>
                <option value="Fire">Fire</option>
                <option value="Violence">Violence</option>
                <option value="Hazard">Hazard</option>
                <option value="Structural">Structural</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Casualty Count</label>
              <input
                type="number"
                min={1}
                max={500}
                value={peopleCount}
                onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Distress Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Enter freeform emergency description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
            <div>
              <span>Latitude: {lat}</span>
            </div>
            <div>
              <span>Longitude: {lon}</span>
            </div>
          </div>
        </div>

        {/* Right: AI Diagnostic Breakdown */}
        <div className="space-y-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Orchestration Outputs</span>
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                result.finalSeverityLevel === 'High'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : result.finalSeverityLevel === 'Medium'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              Severity: {result.finalSeverityScore.toFixed(1)} / 10 · {result.finalSeverityLevel}
            </span>
          </h2>

          {/* Probability distributions */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>TF-IDF + Logistic Regression Probabilities</span>
              <span className="text-cyan-400">Predicted: {result.mlLevel}</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-rose-400">High Emergency</span>
                <span className="text-slate-300">
                  {Math.round(result.mlProbabilities.High * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${result.mlProbabilities.High * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-amber-400">Medium Emergency</span>
                <span className="text-slate-300">
                  {Math.round(result.mlProbabilities.Medium * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${result.mlProbabilities.Medium * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-emerald-400">Low Emergency</span>
                <span className="text-slate-300">
                  {Math.round(result.mlProbabilities.Low * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${result.mlProbabilities.Low * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Triggered Rules Box */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-xs font-mono">
            <div className="font-bold text-slate-300 uppercase text-[10px]">
              Triggered Heuristic Rules ({result.triggeredRules.length}):
            </div>
            {result.triggeredRules.map((rule, idx) => (
              <div key={idx} className="text-slate-300 text-[11px]">
                &bull; {rule}
              </div>
            ))}
          </div>

          {/* Extractive Summary */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1 text-xs font-mono">
            <div className="font-bold text-cyan-400 uppercase text-[10px]">
              Extractive Dispatch Summary:
            </div>
            <div className="text-slate-200">"{result.summary}"</div>
          </div>

          {/* Haversine Proximity Top Responder */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase text-[10px] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Haversine Nearest Available Responder:</span>
              </span>
              <span className="text-emerald-400 font-bold">
                {rankedResponders[0]?.distanceMeters}m · ETA ~{rankedResponders[0]?.etaMinutes}m
              </span>
            </div>
            <div className="text-slate-200 font-bold">
              {rankedResponders[0]?.name} ({rankedResponders[0]?.specialization})
            </div>
            <div className="text-slate-400 text-[11px]">
              Vehicle: {rankedResponders[0]?.vehicle} · Status: {rankedResponders[0]?.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
