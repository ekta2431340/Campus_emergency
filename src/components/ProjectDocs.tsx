import React, { useState } from 'react';
import { BookOpen, HelpCircle, Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const VIVA_QA = [
  {
    q: 'What is the core problem your BCA final-year project solves?',
    a: 'Traditional campus safety relies on chaotic verbal phone calls or scattered chat groups, leading to descriptive ambiguity without clinical triage. Our system automates instantaneous severity evaluation (0.0 to 10.0 scale) using a hybrid rule engine and TF-IDF + Logistic Regression ML pipeline, generates extractive tactical summaries, and calculates the closest available responder using the Haversine formula in under 200 milliseconds.',
  },
  {
    q: 'Why did you choose Python Flask instead of Django or Java?',
    a: '1. Lightweight & Modular: Flask is a micro-framework that avoids monolithic ORM overhead.\n2. Native AI/ML Ecosystem: Python is the industry standard for scikit-learn, NumPy, and NLP tools. Executing ML inference directly in Flask request cycles requires zero inter-process latency.\n3. Minimal Footprint: The entire Flask app runs effortlessly on resource-constrained campus servers or Windows laptops without heavy memory footprints.',
  },
  {
    q: 'Why use a dual-layer approach (Rule Engine + ML) instead of ML alone?',
    a: 'Pure machine learning models are statistical and probabilistic—they can suffer from false negatives on unusual phrasing. In life-critical emergency triage, a false negative is unacceptable. The deterministic Rule Engine acts as an uncompromising safety net: if catastrophic indicators (unconscious, not breathing, fire, cardiac, knife, explosion) appear, the system forces a High Severity rating (>= 7.0) regardless of statistical ML confidence.',
  },
  {
    q: 'Explain how TF-IDF vectorization works in your emergency pipeline.',
    a: 'TF-IDF stands for Term Frequency - Inverse Document Frequency. Term Frequency (TF) measures how often an emergency term occurs in a specific text. Inverse Document Frequency (IDF) penalizes ubiquitous common words (like "the", "in") and boosts rare, critical domain terms (like "defibrillator", "seizure", "explosion"). By multiplying TF by IDF, we get a numerical sparse vector representing the semantic weight of emergency keywords.',
  },
  {
    q: 'Why did you select Logistic Regression over complex Deep Learning / Neural Networks?',
    a: '1. Ultra-Low Latency: Logistic Regression evaluates a linear dot product and Softmax in < 2ms.\n2. Explainability: Linear coefficients directly show which words triggered a classification, satisfying academic auditability.\n3. Data Efficiency: Deep neural networks overfit severely on smaller datasets, whereas regularized Logistic Regression generalizes robustly without GPU hardware.',
  },
  {
    q: 'What is the Haversine formula and why is standard Euclidean distance unsuitable?',
    a: "The Earth is an oblate sphere, not a flat 2D plane. Standard Euclidean distance (sqrt(dx^2 + dy^2)) causes immense distortion because lines of longitude converge at the poles. The Haversine formula calculates the true great-circle distance between two latitude/longitude pairs across a sphere of radius R = 6371 km using spherical trigonometry, producing exact geodesic distances in meters.",
  },
  {
    q: 'How does your rule-based NLP message summarization work?',
    a: 'First responders reading mobile notifications cannot read lengthy paragraphs. The summarizer extracts the primary informative clause using regex sentence segmentation, combines the urgency tag ([URGENT], [ATTENTION], [ROUTINE]), incident category, location, and casualty quantifier, producing a standardized, radio-ready 1-line tactical brief.',
  },
  {
    q: 'How does the system handle students who refuse or lack GPS permissions?',
    a: 'Graceful Degradation: The system first queries the HTML5 Browser Geolocation API (navigator.geolocation.getCurrentPosition). If permission is denied or device GPS is unavailable, the user can pick from a pre-configured Campus Landmark Dropdown (e.g., Science Complex, Library, Hostel B), each pre-mapped to verified GPS coordinates.',
  },
  {
    q: 'How is user security and CSRF prevented in Flask?',
    a: 'Passwords are never stored in plaintext—we use Werkzeug\'s PBKDF2 with SHA-256 and cryptographic salts. CSRF protection is enforced via Flask-WTF tokens bound to encrypted session cookies. Role-Based Access Control (RBAC) decorators ensure students cannot access admin routes.',
  },
  {
    q: 'What are Mock Notifications and why are they implemented by default?',
    a: 'Real SMS gateways (like Twilio) require paid enterprise accounts and telecommunication DLT registrations. Our MockNotificationDispatcher formats realistic SMS and push payloads, generates unique dispatch IDs (e.g. MOCK-NOTIF-XXXXXX), delivery receipts, and timestamps, and logs them into the database for live inspection in the Admin Command Center.',
  },
];

export const ProjectDocs: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<'report' | 'viva' | 'setup'>('report');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const copyCommands = () => {
    navigator.clipboard.writeText('pip install -r requirements.txt\npython run.py');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold font-mono">
              Academic Documentation & Viva Guide
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">BCA Final-Year Capstone</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Project Report, Viva Voce & Setup Guide
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveDocTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeDocTab === 'report' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Project Report
          </button>
          <button
            onClick={() => setActiveDocTab('viva')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeDocTab === 'viva' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Viva Voce Q&A ({VIVA_QA.length})
          </button>
          <button
            onClick={() => setActiveDocTab('setup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeDocTab === 'setup' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Windows Setup
          </button>
        </div>
      </div>

      {/* Tab 1: Project Report */}
      {activeDocTab === 'report' && (
        <div className="space-y-6 text-slate-200">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div>
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                BCA Final Year Capstone Project
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">
                Context-Aware AI Campus Emergency Orchestration System
              </h2>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Full-Stack Python Flask &middot; Bootstrap 5 &middot; SQLite &middot; Scikit-Learn ML &middot; Haversine Routing
              </div>
            </div>

            {/* Chapter 1 */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Chapter 1: Abstract & Problem Formulation</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Large academic campuses span dozens of hectares with thousands of students, faculty, and research facilities. In sudden crises (cardiac arrests, science lab chemical fires, lift entrapments, violent altercations), traditional telephonic dispatch creates massive bottlenecks. This project presents a context-aware emergency orchestration system that accepts distress alerts via browser clients, computes a 0.0–10.0 severity score using a dual-layer AI pipeline (keyword rule heuristics + TF-IDF Logistic Regression), generates extractive 1-line tactical briefs, and ranks responders using the mathematical Haversine great-circle formula.
              </p>
            </div>

            {/* Chapter 2: System Architecture & ASCII DFD */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h3 className="text-lg font-bold text-white">Chapter 2: System Architecture & Data Flow</h3>
              <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800">
                <pre>{`[ Student Mobile / Web ]  --> GPS Lat/Lon / Landmark + Distress Message + People Count
         │
         ▼
[ Flask Application Server ] (Flask 3.0, Flask-Login, Flask-SQLAlchemy)
         │
         ├──> [ Layer 1: Rule Engine ] (Life-threat keywords, mass casualty multipliers)
         ├──> [ Layer 2: TF-IDF + Logistic Regression ] (N-gram vectorizer, probability distribution)
         ├──> [ Layer 3: Hybrid Fusion ] (Score: 0.0 to 10.0, Level: Low / Medium / High)
         ├──> [ Layer 4: NLP Summarizer ] (Standardized 1-sentence radio/SMS brief)
         └──> [ Layer 5: Haversine Dispatch ] (Great-circle distance in meters, ETA calculation)
         │
         ▼
[ Database & Notification Audit ] (SQLite campus_emergency.db / Mock SMS & Push logs)
         │
    ┌────┴─────────────────────────────┐
    ▼                                  ▼
[ Command Center (Admin) ]     [ Tactical Unit (Responder) ]`}</pre>
              </div>
            </div>

            {/* Chapter 3: Mathematical Formulations */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h3 className="text-lg font-bold text-white">Chapter 3: Mathematical Formulations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-rose-400 font-bold uppercase">1. Haversine Distance Formula</div>
                  <div className="text-slate-300">
                    a = sin²(Δφ/2) + cos(φ₁)·cos(φ₂)·sin²(Δλ/2)
                    <br />
                    c = 2 · atan2(√a, √(1-a))
                    <br />
                    d = R · c  (R = 6,371 km)
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Calculates true geodesic ground distance in meters between student coordinates and active campus responders.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-amber-400 font-bold uppercase">2. Hybrid Severity Fusion</div>
                  <div className="text-slate-300">
                    If N_critical &ge; 1: Score = S_rule
                    <br />
                    Else: Score = clamp(0.6·S_rule + 0.4·S_ML, 0.5, 10.0)
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Guarantees deterministic safety rating for life-threatening keywords while retaining statistical generalization.
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter 4: Database Schema (3NF) */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h3 className="text-lg font-bold text-white">Chapter 4: Normalized Database Entities (3NF)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-cyan-400">users</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    id, name, email, password_hash, role, phone, campus_id
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-emerald-400">responder_profiles</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    id, user_id, specialization, current_status, latitude, longitude, vehicle
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-rose-400">incidents</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    id, student_id, type, message, location, lat, lon, score, level, summary, status
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-amber-400">notification_logs</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    id, incident_id, dispatch_id, recipient, channel, content, status, timestamp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Viva Voce Q&A */}
      {activeDocTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 font-mono">
            &bull; Prepared specifically for BCA External Examiners and University Evaluation Panels. Click any question to reveal the comprehensive technical answer.
          </div>

          <div className="space-y-3">
            {VIVA_QA.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-100 hover:text-rose-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-rose-500 font-bold">
                        Q{index + 1}.
                      </span>
                      <span>{item.q}</span>
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed font-sans whitespace-pre-line">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Windows Setup */}
      {activeDocTab === 'setup' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Windows 10 / 11 Installation Guide
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Local Machine Execution Instructions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Follow these standard commands in Command Prompt (cmd.exe) or PowerShell:
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Terminal Commands:</span>
              <button
                onClick={copyCommands}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copied!' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-emerald-400 overflow-x-auto p-3 bg-slate-900 rounded-lg">
              {`# Step 1: Create & activate virtual environment
python -m venv venv
venv\\Scripts\\activate

# Step 2: Install dependencies
pip install -r requirements.txt

# Step 3: Run the system
python run.py`}
            </pre>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="font-bold text-white">Default Sample Accounts:</div>
            <div className="p-3 rounded-lg bg-slate-800 font-mono space-y-1">
              <div>&bull; Admin: <span className="text-rose-400">admin@campus.edu</span> / admin123</div>
              <div>&bull; Student: <span className="text-cyan-400">student@campus.edu</span> / student123</div>
              <div>&bull; Responder: <span className="text-amber-400">responder.fire@campus.edu</span> / resp123</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
