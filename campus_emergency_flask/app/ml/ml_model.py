"""
Machine Learning Severity Classifier (TF-IDF + Logistic Regression)
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

import os
import csv
import logging
from typing import Dict, Tuple, Optional

logger = logging.getLogger(__name__)

# Fallback in-memory dataset if CSV not loaded
DEFAULT_TRAIN_DATA = [
    ("unconscious not breathing cardiac arrest defibrillator", "High", 9.8),
    ("fire smoke flames chemicals exploding lab", "High", 9.5),
    ("knife weapon active attacker stabbing violence", "High", 9.7),
    ("massive toxic gas leak students choking fainting", "High", 9.0),
    ("fainted dehydration conscious drinking water", "Medium", 4.5),
    ("electrical sparks burning smell breaker tripped", "Medium", 5.5),
    ("verbal argument pushing near cafeteria", "Medium", 4.8),
    ("water pipe burst slippery corridor floor", "Medium", 4.0),
    ("minor paper cut need bandaid", "Low", 1.0),
    ("lost student id card sports ground", "Low", 1.2),
    ("mild headache exam hall paracetamol", "Low", 2.0),
    ("broken glass window sweep up needed", "Low", 2.5),
    ("lift stuck students trapped elevator panic", "High", 8.5),
    ("severe asthma attack blue lips inhaler needed", "High", 9.0)
]

class EmergencySeverityML:
    def __init__(self, dataset_path: Optional[str] = None):
        self.dataset_path = dataset_path or os.path.join(os.path.dirname(__file__), "dataset.csv")
        self.vectorizer = None
        self.classifier = None
        self.is_trained = False
        self._initialize_model()

    def _initialize_model(self):
        """Train or load TF-IDF + Logistic Regression pipeline."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression

            texts = []
            labels = []
            
            # Attempt to load CSV
            if os.path.exists(self.dataset_path):
                with open(self.dataset_path, mode='r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        # Combine incident type and message for context
                        combined = f"{row.get('incident_type', '')} {row.get('message', '')}".strip()
                        texts.append(combined)
                        labels.append(row.get('severity_level', 'Medium'))
            else:
                for text, level, _ in DEFAULT_TRAIN_DATA:
                    texts.append(text)
                    labels.append(level)

            if len(texts) < 5:
                for text, level, _ in DEFAULT_TRAIN_DATA:
                    texts.append(text)
                    labels.append(level)

            self.vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                sublinear_tf=True,
                lowercase=True,
                stop_words='english'
            )
            X = self.vectorizer.fit_transform(texts)
            
            self.classifier = LogisticRegression(
                max_iter=1000,
                class_weight='balanced',
                C=2.0
            )
            self.classifier.fit(X, labels)
            self.is_trained = True
            logger.info("Emergency ML Model trained successfully on %d samples", len(texts))
        except Exception as e:
            logger.warning("ML Model init error (%s), using rule-based fallback mode", str(e))
            self.is_trained = False

    def predict(self, incident_type: str, message: str) -> Dict:
        """
        Predicts severity level and probability distribution using TF-IDF + Logistic Regression.
        Includes robust fallback if scikit-learn is not available or input is empty.
        """
        combined_text = f"{incident_type} {message}".strip()
        
        if not self.is_trained or not self.vectorizer or not self.classifier:
            return {
                "ml_level": "Medium",
                "ml_confidence": 0.50,
                "probabilities": {"Low": 0.25, "Medium": 0.50, "High": 0.25},
                "status": "fallback_mode"
            }

        try:
            X_input = self.vectorizer.transform([combined_text])
            probs = self.classifier.predict_proba(X_input)[0]
            classes = self.classifier.classes_
            
            prob_dict = {cls_name: round(float(prob), 3) for cls_name, prob in zip(classes, probs)}
            best_class = max(prob_dict, key=prob_dict.get)
            best_prob = prob_dict[best_class]
            
            return {
                "ml_level": best_class,
                "ml_confidence": best_prob,
                "probabilities": prob_dict,
                "status": "active"
            }
        except Exception as e:
            logger.error("ML prediction error: %s", str(e))
            return {
                "ml_level": "Medium",
                "ml_confidence": 0.50,
                "probabilities": {"Low": 0.33, "Medium": 0.34, "High": 0.33},
                "status": f"error_fallback: {e}"
            }

# Singleton instance
ml_service = EmergencySeverityML()
