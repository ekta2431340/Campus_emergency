import { IncidentType, Responder, SeverityLevel } from '../types';

// Critical life-threat keywords
export const LIFE_THREAT_KEYWORDS: Record<string, number> = {
  unconscious: 3.5,
  'not breathing': 4.0,
  cardiac: 3.8,
  'heart attack': 3.8,
  'bleeding profusely': 3.2,
  'head injury': 3.0,
  seizure: 2.8,
  choking: 3.5,
  defibrillator: 3.0,
  'asthma attack': 2.8,
  cyanosis: 3.5,
  'blue lips': 3.0,
  anaphylaxis: 3.5,
  knife: 4.0,
  gun: 4.5,
  weapon: 3.5,
  'active shooter': 5.0,
  hostage: 4.5,
  explosion: 4.0,
  'chemicals exploding': 4.2,
  'toxic gas': 3.8,
  electrocution: 3.8,
  'trapped in elevator': 3.0,
  'structural collapse': 4.0,
};

export const MODERATE_KEYWORDS: Record<string, number> = {
  smoke: 2.0,
  sparks: 1.8,
  fainted: 1.8,
  dizziness: 1.5,
  fight: 2.2,
  assault: 2.5,
  intruder: 2.2,
  trespassing: 1.8,
  snatched: 1.8,
  'gas smell': 2.2,
  'water leak': 1.2,
  'broken glass': 1.2,
  swollen: 1.5,
  'panic attack': 1.8,
  hyperventilating: 2.0,
  sprain: 1.0,
  bleeding: 1.8,
};

export const LOW_KEYWORDS: Record<string, number> = {
  'paper cut': -1.5,
  'lost id': -2.0,
  'lost bag': -1.5,
  flickering: -1.0,
  paracetamol: -1.5,
  bandaid: -2.0,
  headache: -0.8,
  accidental: -2.0,
  test: -2.0,
  routine: -1.5,
};

export const BASE_SEVERITY_BY_TYPE: Record<IncidentType, number> = {
  Fire: 5.5,
  Medical: 4.5,
  Violence: 5.0,
  Hazard: 4.0,
  Structural: 3.8,
  General: 2.0,
};

export interface AIAnalysisResult {
  ruleScore: number;
  ruleLevel: SeverityLevel;
  mlLevel: SeverityLevel;
  mlConfidence: number;
  mlProbabilities: { Low: number; Medium: number; High: number };
  finalSeverityScore: number;
  finalSeverityLevel: SeverityLevel;
  summary: string;
  triggeredRules: string[];
  criticalHits: number;
}

export function analyzeEmergencyIncident(
  incidentType: IncidentType,
  message: string,
  locationName: string,
  peopleCount: number = 1
): AIAnalysisResult {
  const text = (message || '').toLowerCase();
  let score = BASE_SEVERITY_BY_TYPE[incidentType] || 3.0;
  const triggeredRules: string[] = [];

  triggeredRules.push(`Base category '${incidentType}' baseline score: ${score.toFixed(1)}`);

  // Check critical keywords
  const matchedCritical: string[] = [];
  Object.entries(LIFE_THREAT_KEYWORDS).forEach(([kw, boost]) => {
    if (text.includes(kw)) {
      score += boost;
      matchedCritical.push(`${kw} (+${boost})`);
    }
  });
  if (matchedCritical.length > 0) {
    triggeredRules.push(`Life-threat keywords detected: ${matchedCritical.join(', ')}`);
  }

  // Check moderate keywords
  const matchedMod: string[] = [];
  Object.entries(MODERATE_KEYWORDS).forEach(([kw, boost]) => {
    if (text.includes(kw)) {
      score += boost;
      matchedMod.push(`${kw} (+${boost})`);
    }
  });
  if (matchedMod.length > 0) {
    triggeredRules.push(`Secondary alert indicators: ${matchedMod.join(', ')}`);
  }

  // Check low keywords
  const matchedLow: string[] = [];
  Object.entries(LOW_KEYWORDS).forEach(([kw, discount]) => {
    if (text.includes(kw)) {
      score += discount;
      matchedLow.push(`${kw} (${discount})`);
    }
  });
  if (matchedLow.length > 0) {
    triggeredRules.push(`De-escalation modifiers: ${matchedLow.join(', ')}`);
  }

  // Multi-person exposure
  if (peopleCount > 25) {
    score += 2.0;
    triggeredRules.push(`High population exposure (>25 people involved: +2.0)`);
  } else if (peopleCount >= 5) {
    score += 1.0;
    triggeredRules.push(`Multi-person risk (${peopleCount} people: +1.0)`);
  }

  const ruleScore = Math.max(0.5, Math.min(10.0, Math.round(score * 10) / 10));
  const ruleLevel: SeverityLevel = ruleScore >= 7.0 ? 'High' : ruleScore >= 4.0 ? 'Medium' : 'Low';

  // --- Step 2: TF-IDF + Logistic Regression Simulation ---
  // High indicator terms
  const highTerms = ['unconscious', 'not breathing', 'fire', 'knife', 'explosion', 'cardiac', 'bleeding', 'trapped', 'gas', 'urgent'];
  const lowTerms = ['lost', 'cut', 'headache', 'paracetamol', 'id', 'bag', 'routine'];
  
  let highWeight = 0.1;
  let lowWeight = 0.1;
  let medWeight = 0.2;

  highTerms.forEach((term) => {
    if (text.includes(term)) highWeight += 0.35;
  });
  lowTerms.forEach((term) => {
    if (text.includes(term)) lowWeight += 0.3;
  });

  if (incidentType === 'Fire' || incidentType === 'Violence' || incidentType === 'Medical') {
    highWeight += 0.2;
    medWeight += 0.2;
  } else if (incidentType === 'General') {
    lowWeight += 0.3;
  }

  const total = highWeight + medWeight + lowWeight;
  const pHigh = Math.round((highWeight / total) * 100) / 100;
  const pMed = Math.round((medWeight / total) * 100) / 100;
  const pLow = Math.round((1 - pHigh - pMed) * 100) / 100;

  let mlLevel: SeverityLevel = 'Medium';
  let mlConfidence = pMed;

  if (pHigh >= pMed && pHigh >= pLow) {
    mlLevel = 'High';
    mlConfidence = pHigh;
  } else if (pLow >= pMed && pLow >= pHigh) {
    mlLevel = 'Low';
    mlConfidence = pLow;
  }

  // --- Step 3: Hybrid Severity Fusion ---
  let finalScore: number;
  let finalLevel: SeverityLevel;

  if (matchedCritical.length > 0) {
    finalScore = ruleScore;
    finalLevel = ruleScore >= 7.0 ? 'High' : 'Medium';
  } else {
    const mlScoreMap = { Low: 2.0, Medium: 5.0, High: 8.5 };
    const mlMapped = mlScoreMap[mlLevel];
    finalScore = Math.round((0.6 * ruleScore + 0.4 * mlMapped) * 10) / 10;
    finalScore = Math.max(0.5, Math.min(10.0, finalScore));
    finalLevel = finalScore >= 7.0 ? 'High' : finalScore >= 4.0 ? 'Medium' : 'Low';
  }

  // --- Step 4: NLP Incident Summarizer ---
  const urgencyTag = finalLevel === 'High' ? 'URGENT' : finalLevel === 'Medium' ? 'ATTENTION' : 'ROUTINE';
  const sentences = (message || '').split(/[.!?\n]+/);
  let coreSentence = sentences[0]?.trim() || message.trim();
  if (coreSentence.length > 100) {
    coreSentence = coreSentence.slice(0, 97) + '...';
  }
  const peopleDesc = peopleCount > 1 ? `affecting ~${peopleCount} people` : peopleCount === 1 ? 'affecting 1 individual' : 'no direct injuries reported';
  const summary = `[${urgencyTag}] ${incidentType} at ${locationName}: "${coreSentence}" (${peopleDesc}).`;

  return {
    ruleScore,
    ruleLevel,
    mlLevel,
    mlConfidence,
    mlProbabilities: { High: pHigh, Medium: pMed, Low: pLow },
    finalSeverityScore: finalScore,
    finalSeverityLevel: finalLevel,
    summary,
    triggeredRules,
    criticalHits: matchedCritical.length,
  };
}

// Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371.0;

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10000) / 10000;
}

export function calculateEtaMinutes(distanceKm: number, specialization: string): number {
  const speeds: Record<string, number> = {
    Medical: 25.0,
    'Fire & Hazmat': 20.0,
    Security: 15.0,
    'General Safety': 12.0,
  };
  const speed = speeds[specialization] || 15.0;
  const travelMinutes = (distanceKm / speed) * 60;
  return Math.max(1, Math.round(travelMinutes + 1));
}

export interface RankedResponder extends Responder {
  distanceKm: number;
  distanceMeters: number;
  etaMinutes: number;
  isSpecialtyMatch: boolean;
}

export function rankRespondersProximity(
  incidentLat: number,
  incidentLon: number,
  incidentType: IncidentType,
  responders: Responder[]
): RankedResponder[] {
  const targetSpecialtyMap: Record<IncidentType, string[]> = {
    Medical: ['Medical'],
    Fire: ['Fire & Hazmat'],
    Violence: ['Security'],
    Hazard: ['Fire & Hazmat', 'Security'],
    Structural: ['General Safety', 'Security'],
    General: ['Security', 'General Safety'],
  };

  const targets = targetSpecialtyMap[incidentType] || ['Security'];

  const ranked: RankedResponder[] = responders.map((r) => {
    const distKm = haversineDistanceKm(incidentLat, incidentLon, r.latitude, r.longitude);
    const distM = Math.round(distKm * 1000);
    const eta = calculateEtaMinutes(distKm, r.specialization);
    const isMatch = targets.some((t) => r.specialization.includes(t));

    return {
      ...r,
      distanceKm: distKm,
      distanceMeters: distM,
      etaMinutes: eta,
      isSpecialtyMatch: isMatch,
    };
  });

  // Sort available first, then specialty match, then shortest distance
  ranked.sort((a, b) => {
    const statusRankA = a.status === 'Available' ? 0 : a.status === 'On Duty' ? 1 : a.status === 'Busy' ? 2 : 3;
    const statusRankB = b.status === 'Available' ? 0 : b.status === 'On Duty' ? 1 : b.status === 'Busy' ? 2 : 3;

    if (statusRankA !== statusRankB) return statusRankA - statusRankB;
    if (a.isSpecialtyMatch !== b.isSpecialtyMatch) return a.isSpecialtyMatch ? -1 : 1;
    return a.distanceMeters - b.distanceMeters;
  });

  return ranked;
}
