# BCA Final-Year Project Viva Voce: Master Q&A Guide
## "Context-Aware AI Campus Emergency Orchestration System"

---

### SECTION 1: ARCHITECTURE & PROJECT MOTIVATION

#### Q1: What is the core problem your project solves?
**Answer:** Traditional campus emergency reporting relies on uncoordinated phone calls or manual shouting, causing three critical failures: ambiguous panic descriptions without clinical context, lack of severity prioritization (a lost wallet gets the same response time as a heart attack), and unoptimized responder dispatch. Our system automates instantaneous AI triage (0.0 to 10.0 severity score), generates extractive tactical summaries, and calculates the closest available responder using the Haversine formula in under 200 milliseconds.

#### Q2: Why did you choose Python Flask instead of Django or Java?
**Answer:** 
1. **Lightweight & Modular:** Flask is a micro-framework that gives complete architectural freedom without Django's heavy ORM overhead or monolithic configuration.
2. **First-Class Machine Learning Integration:** Python is the native ecosystem for scikit-learn, NumPy, and NLP tools. Integrating ML inference directly within Flask request-response cycles requires zero inter-process bridging or REST microservice latency.
3. **Low Memory Footprint:** The entire Flask app runs comfortably on resource-constrained campus servers or single-board units.

#### Q3: Why do you have three distinct user roles (Student, Admin, Responder)?
**Answer:** This enforces the Principle of Least Privilege (PoLP):
- **Students** only have permission to transmit emergencies and track their own reports to prevent campus-wide alarm fatigue or data leaks.
- **Administrators** hold command clearance to view all incidents sorted by severity, override scores, reassign units, and inspect notification audit trails.
- **Responders** possess a focused operational cockpit where they see only incidents assigned to their unit and can quickly toggle their duty availability and tactical status.

---

### SECTION 2: ARTIFICIAL INTELLIGENCE, ML & NLP

#### Q4: Why did you use a dual-layer approach (Rule Engine + ML) instead of ML alone?
**Answer:** Pure machine learning models are statistical and probabilistic—they can suffer from false negatives on out-of-distribution phrases. In life-critical emergency triage, a false negative is unacceptable (e.g., classifying a phrase like *"Senior professor collapsed with chest pain"* as Low). The deterministic Rule Engine acts as an uncompromising safety net: if catastrophic indicators (unconscious, not breathing, fire, cardiac, knife) appear, the system forces a High Severity rating ($\ge 7.0$) regardless of ML probabilities. The ML model complements this by identifying nuanced, contextual distress patterns across non-obvious phrasing.

#### Q5: Explain how TF-IDF works in your application.
**Answer:** TF-IDF stands for **Term Frequency - Inverse Document Frequency**:
1. **Term Frequency (TF):** Measures how frequently a word occurs in a specific incident text:
   $$\text{TF}(t, d) = \frac{\text{Count of } t \text{ in } d}{\text{Total words in } d}$$
2. **Inverse Document Frequency (IDF):** Penalizes ubiquitous stop words (like "the", "in", "is") and boosts domain-critical rare words (like "defibrillator", "seizure", "explosion"):
   $$\text{IDF}(t) = \log\left(\frac{1 + N}{1 + \text{DF}(t)}\right) + 1$$
3. By multiplying TF by IDF, we obtain a numerical sparse vector representing the semantic weight of emergency terms in that distress message.

#### Q6: Why did you select Logistic Regression over complex Deep Learning / Neural Networks?
**Answer:**
1. **Ultra-Low Latency:** Logistic Regression evaluates a linear dot product $\mathbf{w}^T X + b$ followed by a sigmoid/softmax in $< 2$ milliseconds, which is critical for emergency triage.
2. **Interpretability:** Its coefficients directly show which words triggered a classification, satisfying academic auditability and explainability.
3. **No GPU Requirement:** Runs effortlessly on standard campus CPU hardware.
4. **Data Efficiency:** On datasets with tens to hundreds of samples, deep neural networks overfit severely, whereas regularized Logistic Regression generalizes robustly.

#### Q7: How does your rule-based NLP message summarization work?
**Answer:** First responders reading mobile notifications on the move cannot read lengthy paragraphs. The summarizer:
1. Strips filler phrases and isolates the primary informative clause using regex sentence segmentation.
2. Combines the urgency tag (`[URGENT]`, `[ATTENTION]`, or `[ROUTINE]`), incident category, campus location, and a casualty quantifier (e.g., *"affecting ~15 people"*).
3. Produces a standardized, radio-ready 1-line tactical brief: `"[URGENT] Fire at Science Complex: 'Thick black smoke and chemical flames erupting' (affecting ~15 people)."`

---

### SECTION 3: GEOLOCATION & THE HAVERSINE FORMULA

#### Q8: What is the Haversine formula and why can't you just use standard Pythagorean distance?
**Answer:** The Earth is an oblate spheroid, not a flat 2D plane. Standard Euclidean distance ($\sqrt{\Delta x^2 + \Delta y^2}$) introduces immense distortion because lines of longitude converge at the poles. The Haversine formula calculates the great-circle distance between two latitude/longitude pairs across a sphere of radius $R = 6371\text{ km}$:
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c$$
This yields precise geodesic distances in meters, which is essential for determining whether Responder A or Responder B is truly closer.

#### Q9: How does the system handle students who refuse or lack GPS permissions?
**Answer:** The system features **Graceful Degradation**:
1. It first attempts to invoke the HTML5 Browser Geolocation API (`navigator.geolocation.getCurrentPosition`).
2. If the user declines permission, operates indoors without GPS signal, or uses a desktop browser, the interface provides a pre-configured **Campus Landmark Dropdown** (e.g., *Science Complex, Library, Hostel Block B*), each pre-mapped to verified reference coordinates.

#### Q10: How do you compute the Estimated Time of Arrival (ETA)?
**Answer:** We model real-world campus transit dynamics:
$$\text{ETA (minutes)} = \left\lceil \frac{\text{Distance in km}}{\text{Speed in km/h}} \times 60 \right\rceil + 1\text{ min prep time}$$
Where speed depends on unit modality: Medical Ambulance ($25\text{ km/h}$), Fire Unit ($20\text{ km/h}$), Security Buggy ($15\text{ km/h}$), Foot Patrol ($5\text{ km/h}$).

---

### SECTION 4: DATABASE, FLASK & SECURITY

#### Q11: Explain your database schema normalization.
**Answer:** The relational database is normalized to Third Normal Form (3NF):
- `User` table holds identity, hashed credentials, and role.
- `ResponderProfile` maintains 1-to-1 extension with `User`, separating tactical telemetry (status, coordinates, vehicle) from general student attributes.
- `Incident` holds emergency telemetry, foreign-keyed to the reporting `Student` and the assigned `ResponderProfile`.
- `IncidentUpdate` and `NotificationLog` are 1-to-many child tables capturing temporal history and delivery audit logs without repeating incident data.

#### Q12: How are user passwords secured?
**Answer:** Passwords are never stored in plaintext. We utilize Werkzeug's `generate_password_hash` implementation using PBKDF2 (Password-Based Key Derivation Function 2) combined with SHA-256 and cryptographic salts. This renders rainbow-table lookups computationally infeasible.

#### Q13: How does Flask-Login manage session state?
**Answer:** Flask-Login stores an encrypted, signed session cookie on the client's browser. On each incoming request, the `@login_manager.user_loader` callback extracts the user ID from the session cookie, queries the database, and injects the populated `current_user` proxy object into the application context.

#### Q14: How is CSRF (Cross-Site Request Forgery) mitigated?
**Answer:** Using Flask-WTF / WTForms, forms generate a cryptographically signed token bound to the user's session. Any incoming POST request lacking this valid token is rejected with an HTTP 400 Bad Request error.

#### Q15: What are Mock Notifications and why are they used?
**Answer:** Real-world SMS gateways (like Twilio) require paid enterprise subscriptions and hardware sender ID registrations. For academic and staging environments, our `MockNotificationDispatcher` simulates the entire payload formatting, generates unique dispatch IDs (`MOCK-NOTIF-XXXXXX`), timestamps, and delivery receipts, and stores them in `NotificationLog` for live inspection in the Admin Command Center.

---

### SECTION 5: RAPID-FIRE VIVA QUESTIONS

- **Q: What is the port number for standard Flask apps?** $\to$ Port 5000.
- **Q: What is the primary key in your Incident table?** $\to$ An auto-incrementing integer `id`.
- **Q: What happens if scikit-learn is not installed on a target PC?** $\to$ The app gracefully catches the import exception and operates in deterministic Rule-Based Fallback mode without crashing.
- **Q: How can you switch between SQLite and MySQL?** $\to$ By simply altering the `SQLALCHEMY_DATABASE_URI` environment variable in `config.py` (e.g. `mysql+pymysql://user:password@localhost/emergency_db`).
- **Q: How does the Admin dashboard prioritize emergencies?** $\to$ Through SQL ordering: `order_by(Incident.severity_score.desc(), Incident.created_at.desc())`.
