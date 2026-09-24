import React, { useState } from 'react';
import { Download, FileCode, Folder, Copy, Check, Terminal } from 'lucide-react';

interface CodeBrowserProps {
  onDownloadZip: () => void;
  isDownloading: boolean;
}

const CODE_FILES: Record<string, { path: string; language: string; content: string }> = {
  'run.py': {
    path: 'run.py',
    language: 'python',
    content: `"""
Application Entry Point - Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
Execution on Windows:
    pip install -r requirements.txt
    python run.py
"""

import os
import sys
from app import create_app
from app.models import db, User

app = create_app()

def initialize_app():
    with app.app_context():
        db.create_all()
        if not User.query.first():
            print("First run: automatically seeding default accounts and sample data...")
            try:
                from seed_data import seed_database
                seed_database()
            except Exception as e:
                print(f"Warning during seeding: {e}")

if __name__ == '__main__':
    initialize_app()
    port = int(os.environ.get('PORT', 5000))
    print("\\n" + "=" * 70)
    print("  CONTEXT-AWARE AI CAMPUS EMERGENCY ORCHESTRATION SYSTEM")
    print("  BCA Final-Year Capstone Project")
    print(f"  Server running locally at: http://127.0.0.1:{port}")
    print("  Default Login Accounts:")
    print("    - Admin:     admin@campus.edu     / admin123")
    print("    - Student:   student@campus.edu   / student123")
    print("    - Responder: responder.fire@campus.edu / resp123")
    print("=" * 70 + "\\n")
    app.run(host='0.0.0.0', port=port, debug=True)
`,
  },
  'rule_engine.py': {
    path: 'app/ml/rule_engine.py',
    language: 'python',
    content: `"""
Rule-Based Severity Detection Engine
Author: BCA Final Year Project
"""

import re
from typing import Dict, List

LIFE_THREAT_KEYWORDS = {
    "unconscious": 3.5, "not breathing": 4.0, "cardiac": 3.8, "heart attack": 3.8,
    "bleeding profusely": 3.2, "knife": 4.0, "gun": 4.5, "explosion": 4.0,
    "chemicals exploding": 4.2, "toxic gas": 3.8, "trapped in elevator": 3.0
}

MODERATE_KEYWORDS = {
    "smoke": 2.0, "sparks": 1.8, "fainted": 1.8, "fight": 2.2,
    "gas smell": 2.2, "water leak": 1.2, "panic attack": 1.8
}

LOW_KEYWORDS = {
    "paper cut": -1.5, "lost id": -2.0, "lost bag": -1.5, "headache": -0.8
}

BASE_SEVERITY_BY_TYPE = {
    "Fire": 5.5, "Medical": 4.5, "Violence": 5.0,
    "Hazard": 4.0, "Structural": 3.8, "General": 2.0
}

def analyze_rules(incident_type: str, message: str, people_count: int = 1) -> Dict:
    text = (message or "").lower()
    score = BASE_SEVERITY_BY_TYPE.get(incident_type, 3.0)
    triggered_rules = [f"Base type '{incident_type}' weight: {score:.1f}"]

    matched_critical = []
    for kw, boost in LIFE_THREAT_KEYWORDS.items():
        if re.search(r'\\b' + re.escape(kw) + r'\\b', text):
            score += boost
            matched_critical.append(f"{kw} (+{boost})")

    if matched_critical:
        triggered_rules.append(f"Life-threat keywords: {', '.join(matched_critical)}")

    if people_count > 25:
        score += 2.0
        triggered_rules.append("High population impact (>25: +2.0)")
    elif people_count >= 5:
        score += 1.0
        triggered_rules.append(f"Multi-person exposure ({people_count}: +1.0)")

    final_score = max(0.5, min(10.0, round(score, 1)))
    level = "High" if final_score >= 7.0 else ("Medium" if final_score >= 4.0 else "Low")

    return {
        "rule_score": final_score,
        "rule_level": level,
        "triggered_rules": triggered_rules,
        "critical_hits": len(matched_critical)
    }
`,
  },
  'ml_model.py': {
    path: 'app/ml/ml_model.py',
    language: 'python',
    content: `"""
Machine Learning Severity Classifier (TF-IDF + Logistic Regression)
Author: BCA Final Year Project
"""

import os
import csv
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class EmergencySeverityML:
    def __init__(self, dataset_path=None):
        self.dataset_path = dataset_path or os.path.join(os.path.dirname(__file__), "dataset.csv")
        self.vectorizer = None
        self.classifier = None
        self.is_trained = False
        self._initialize_model()

    def _initialize_model(self):
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression

            texts, labels = [], []
            if os.path.exists(self.dataset_path):
                with open(self.dataset_path, mode='r', encoding='utf-8') as f:
                    for row in csv.DictReader(f):
                        texts.append(f"{row.get('incident_type', '')} {row.get('message', '')}")
                        labels.append(row.get('severity_level', 'Medium'))

            self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words='english')
            X = self.vectorizer.fit_transform(texts)
            self.classifier = LogisticRegression(max_iter=1000, class_weight='balanced')
            self.classifier.fit(X, labels)
            self.is_trained = True
        except Exception as e:
            self.is_trained = False

    def predict(self, incident_type: str, message: str) -> Dict:
        if not self.is_trained:
            return {"ml_level": "Medium", "ml_confidence": 0.50, "status": "fallback"}
        X_input = self.vectorizer.transform([f"{incident_type} {message}"])
        probs = self.classifier.predict_proba(X_input)[0]
        prob_dict = {cls_name: round(float(prob), 3) for cls_name, prob in zip(self.classifier.classes_, probs)}
        best = max(prob_dict, key=prob_dict.get)
        return {"ml_level": best, "ml_confidence": prob_dict[best], "probabilities": prob_dict}

ml_service = EmergencySeverityML()
`,
  },
  'routing.py': {
    path: 'app/ml/routing.py',
    language: 'python',
    content: `"""
Haversine-Based Responder Routing
Author: BCA Final Year Project
"""

import math

EARTH_RADIUS_KM = 6371.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi, delta_lambda = math.radians(lat2 - lat1), math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(EARTH_RADIUS_KM * c, 4)

def calculate_eta_minutes(distance_km: float, specialization: str = "Security") -> int:
    speeds = {"Medical": 25.0, "Fire": 20.0, "Security": 15.0}
    speed_kmh = speeds.get(specialization, 15.0)
    travel_minutes = (distance_km / speed_kmh) * 60.0
    return max(1, round(travel_minutes + 1))
`,
  },
  'models.py': {
    path: 'app/models.py',
    language: 'python',
    content: `"""
SQLAlchemy Database Models (3NF)
Author: BCA Final Year Project
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Student') # Student, Admin, Responder
    phone = db.Column(db.String(20))
    campus_id = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

class Incident(db.Model):
    __tablename__ = 'incidents'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    incident_type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    location_name = db.Column(db.String(150), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    people_count = db.Column(db.Integer, default=1)
    severity_score = db.Column(db.Float, nullable=False, default=5.0) # 0.0 - 10.0
    severity_level = db.Column(db.String(20), nullable=False, default='Medium')
    summary = db.Column(db.Text)
    status = db.Column(db.String(30), default='Pending') # Pending, Assigned, In-Progress, Resolved
    assigned_responder_id = db.Column(db.Integer, db.ForeignKey('responder_profiles.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
`,
  },
  'requirements.txt': {
    path: 'requirements.txt',
    language: 'text',
    content: `Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.3
Flask-WTF==1.2.1
WTForms==3.1.2
scikit-learn==1.5.0
pandas==2.2.2
numpy==1.26.4
joblib==1.4.2
python-dotenv==1.0.1
Werkzeug==3.0.3
email-validator==2.1.1
`,
  },
};

export const CodeBrowser: React.FC<CodeBrowserProps> = ({ onDownloadZip, isDownloading }) => {
  const [selectedFile, setSelectedFile] = useState('run.py');
  const [copied, setCopied] = useState(false);

  const fileData = CODE_FILES[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner with Download CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold font-mono">
              Project Source Code
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">Complete Python Flask Codebase</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Downloadable Python Project Artifacts
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Download the complete standalone folder with all Python scripts, models, dataset, templates, and documentation.
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold shadow-lg shadow-rose-950 transition-all flex items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Building ZIP Archive...' : 'Download Project (.ZIP)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: File Tree */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Project Explorer</span>
          </div>

          <div className="space-y-1">
            {Object.keys(CODE_FILES).map((fileName) => {
              const isActive = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{fileName}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 space-y-1">
            <div>Total Source Files: 38</div>
            <div>Database: SQLite &middot; 3NF</div>
            <div>ML: Scikit-Learn TF-IDF</div>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-rose-400" />
              <span>{fileData.path}</span>
            </span>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="p-4 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed max-h-[550px] overflow-y-auto">
            <pre>
              <code>{fileData.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
