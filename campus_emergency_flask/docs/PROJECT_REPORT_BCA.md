# Context-Aware AI Campus Emergency Orchestration System
## Bachelor of Computer Applications (BCA) - Final Year Project Report

---

### CHAPTER 1: INTRODUCTION & PROBLEM STATEMENT

#### 1.1 Abstract
Higher education university campuses span sprawling physical hectares, accommodating thousands of students, faculty, and administrative personnel across multiple laboratory blocks, auditoriums, hostels, and sports grounds. During sudden emergencies—such as cardiac arrests, chemical explosions in science laboratories, violent physical altercations, structural lift entrapments, or electrical fires—traditional emergency protocols (manual telephone calls to reception desks or physical intercoms) suffer from severe communication bottlenecks, panic-induced descriptive ambiguity, lack of precise GPS location, and delayed triage. 

This project presents the **"Context-Aware AI Campus Emergency Orchestration System"**, a full-stack web-based incident triage and dispatch platform developed using Python Flask, Flask-SQLAlchemy, Flask-Login, Bootstrap 5, and scikit-learn. The system ingests natural language distress messages from students via mobile or browser clients, evaluates emergency severity on a deterministic 0.0 to 10.0 scale using a hybrid pipeline of keyword rule heuristics and TF-IDF + Logistic Regression machine learning, generates concise extractive dispatch summaries, and applies the mathematical **Haversine formula** to rank and alert the closest available campus first responders in real time.

#### 1.2 Problem Statement
Existing campus safety paradigms face four major systemic limitations:
1. **Unstructured Communication Bottlenecks:** Panicked students report emergencies via verbal phone calls or scattered WhatsApp groups, leading to vague descriptions (e.g., "Someone fell near the lab!") without vital context such as unconsciousness, breathing cessation, or hazardous chemicals.
2. **Absence of Intelligent Triage:** Traditional security desks process alerts in first-in, first-out (FIFO) order rather than by clinical or life-threat severity. A low-priority report regarding a lost student ID card can inadvertently delay response to an active cardiac arrest.
3. **Inefficient Responder Dispatch:** Security administrators often do not know which patrol unit, nurse, or fire safety officer is closest to the incident, resulting in suboptimal transit times.
4. **Lack of Auditability and Closed-Loop Tracking:** Incident outcomes, responder notes, and timestamps are rarely archived in a centralized database for post-incident review and accountability.

#### 1.3 Project Objectives
- Develop an accessible, responsive web application supporting **Student**, **Administrator**, and **Tactical Responder** roles.
- Implement an automated dual-layer emergency classification pipeline combining **domain safety rules** with **TF-IDF + Logistic Regression ML**.
- Automatically compute a **Severity Score (0.0 to 10.0)** and categorized **Severity Level (Low, Medium, High)**.
- Generate high-urgency **NLP executive summaries** for first responders.
- Utilize the **Haversine distance algorithm** to calculate true ground proximity in meters and compute estimated time of arrival (ETA).
- Provide a centralized **Command Center Dashboard** with multi-parameter filtering, responder dispatch controls, and live audit trails.
- Include a mock multi-channel notification dispatcher simulating SMS, push notifications, and email alerts.

---

### CHAPTER 2: SYSTEM ARCHITECTURE & DESIGN

#### 2.1 Architectural Flow Diagram (ASCII Representation)

```
 [ STUDENT DEVICE ] 
        │  (GPS Coordinates / Landmark, Incident Type, Message, People Count)
        ▼
 [ FLASK WEB SERVER / API CONTROLLER ]
        │
        ├──────────────────────────────────────────────────┐
        ▼                                                  ▼
 [ AI ORCHESTRATION PIPELINE ]                    [ DATABASE ENGINE ]
   ├─ 1. Rule Engine (Life threats, keywords)       ├─ SQLite / MySQL
   ├─ 2. TF-IDF + Logistic Regression ML            ├─ Users & Roles
   ├─ 3. Severity Score Fusion (0-10)               ├─ Incidents Log
   ├─ 4. NLP Rule Summarization                     └─ Tactical Responders
   └─ 5. Haversine Dispatch Calculation
        │
        ▼
 [ NOTIFICATION DISPATCHER ]
   ├─ Mock SMS Relay
   └─ In-App Tactical Push
        │
   ┌────┴──────────────────────────────┐
   ▼                                   ▼
 [ COMMAND CENTER (ADMIN) ]    [ RESPONDER CONSOLE ]
   - Live Severity Queue         - Assigned Cases
   - Manual/Auto Dispatch        - Status Toggle (Available/Busy)
   - Triage Notes & Analytics    - Field Action (En Route/Resolved)
```

#### 2.2 Data Flow Diagrams (DFD)

##### Level 0 DFD (Context Diagram)
- **External Entities:** Student, Admin, Responder.
- **Process 0.0:** Campus Emergency Orchestration System.
- **Data Inflows:** Distress report, credentials, dispatch commands, field updates.
- **Data Outflows:** Severity score, tracking updates, dispatch notices, audit logs.

##### Level 1 DFD
1. **1.0 Authentication & RBAC:** Verifies passwords with PBKDF2/SHA256, establishes Flask-Login sessions.
2. **2.0 Incident Ingestion & GPS Geocoding:** Captures browser geolocation or campus landmark dropdowns.
3. **3.0 Context-Aware AI Triage:** Runs `rule_engine.py` and `ml_model.py` to output severity score and summary.
4. **4.0 Proximity Routing Engine:** Executes Haversine calculations against active responder coordinates.
5. **5.0 Notification & Dispatch Management:** Generates audit logs and broadcasts push/SMS payloads.
6. **6.0 Incident Lifecycle Management:** Facilitates updates (Pending $\to$ Assigned $\to$ In-Progress $\to$ Resolved).

#### 2.3 Entity Relationship (ER) Schema

1. **`users` Table:**
   - `id` (INT, Primary Key, Auto-Increment)
   - `name` (VARCHAR(100), NOT NULL)
   - `email` (VARCHAR(120), UNIQUE, Indexed)
   - `password_hash` (VARCHAR(256), NOT NULL)
   - `role` (VARCHAR(20), NOT NULL: 'Student', 'Admin', 'Responder')
   - `phone` (VARCHAR(20))
   - `campus_id` (VARCHAR(50))
   - `created_at` (DATETIME)

2. **`responder_profiles` Table:**
   - `id` (INT, Primary Key)
   - `user_id` (INT, Foreign Key $\to$ `users.id`)
   - `specialization` (VARCHAR(50): 'Medical', 'Fire', 'Security', 'Hazmat', 'General')
   - `current_status` (VARCHAR(30): 'Available', 'On Duty', 'Busy', 'Off Duty')
   - `latitude` (FLOAT), `longitude` (FLOAT)
   - `assigned_vehicle` (VARCHAR(50))

3. **`incidents` Table:**
   - `id` (INT, Primary Key)
   - `student_id` (INT, Foreign Key $\to$ `users.id`)
   - `incident_type` (VARCHAR(50))
   - `message` (TEXT)
   - `location_name` (VARCHAR(150))
   - `latitude` (FLOAT), `longitude` (FLOAT)
   - `people_count` (INT)
   - `severity_score` (FLOAT, 0.0 to 10.0)
   - `severity_level` (VARCHAR(20): 'Low', 'Medium', 'High')
   - `summary` (TEXT)
   - `rule_score` (FLOAT), `ml_level` (VARCHAR(20)), `ml_confidence` (FLOAT)
   - `status` (VARCHAR(30): 'Pending', 'Assigned', 'In-Progress', 'Resolved')
   - `assigned_responder_id` (INT, Foreign Key $\to$ `responder_profiles.id`)
   - `admin_notes` (TEXT)
   - `created_at`, `updated_at`, `resolved_at` (DATETIME)

4. **`notification_logs` Table:**
   - `id` (INT, Primary Key)
   - `incident_id` (INT, Foreign Key $\to$ `incidents.id`)
   - `dispatch_id` (VARCHAR(50))
   - `recipient_name`, `recipient_contact` (VARCHAR(100))
   - `channel` (VARCHAR(20): 'SMS', 'Push', 'Email')
   - `subject`, `content` (TEXT)
   - `status` (VARCHAR(30)), `timestamp` (DATETIME)

---

### CHAPTER 3: ALGORITHM SPECIFICATION & MATHEMATICAL FORMULATIONS

#### 3.1 Supervised Machine Learning: TF-IDF + Logistic Regression
The system employs **Term Frequency - Inverse Document Frequency (TF-IDF)** to vectorize incident descriptions, converting arbitrary text into numerical feature spaces:

$$\text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}$$

$$\text{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

The vectorized matrix $X$ is fed into a multinomial **Logistic Regression** classifier using the Softmax function to compute class posterior probabilities $P(Y = c \mid X)$:

$$P(Y = c \mid X) = \frac{e^{\mathbf{w}_c^T X + b_c}}{\sum_{j=1}^{K} e^{\mathbf{w}_j^T X + b_j}}$$

Where $K \in \{\text{Low}, \text{Medium}, \text{High}\}$.

#### 3.2 Deterministic Safety Rule Engine
While ML handles statistical text patterns, safety-critical systems must guarantee deterministic behavior for known catastrophic phrases. The rule engine enforces:

$$S_{\text{rule}} = S_{\text{base}}(\text{Type}) + \sum_{k \in \mathcal{K}_{\text{critical}}} W_k + \sum_{m \in \mathcal{K}_{\text{mod}}} W_m + M_{\text{people}}$$

- If any critical keyword (e.g. "unconscious", "not breathing", "chemical explosion", "knife", "cardiac") is present, $S_{\text{rule}}$ is bounded to a minimum of 7.0 (High Severity).
- Mass casualty modifier: If `people_count > 25`, $+2.0$; if `people_count >= 5`, $+1.0$.

#### 3.3 Hybrid Severity Fusion Formula
The final severity score $S_{\text{final}} \in [0.0, 10.0]$ is computed as:

$$S_{\text{final}} = \begin{cases} 
S_{\text{rule}} & \text{if } N_{\text{critical}} \ge 1 \\
\text{clamp}\Big(0.6 \cdot S_{\text{rule}} + 0.4 \cdot \text{Score}_{\text{ML}}, \, 0.5, \, 10.0\Big) & \text{otherwise}
\end{cases}$$

#### 3.4 Haversine Distance & Proximity Routing
The great-circle distance $d$ between incident $(\phi_1, \lambda_1)$ and responder $(\phi_2, \lambda_2)$ on a spherical Earth of radius $R = 6371\text{ km}$ is calculated via:

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \, \sqrt{1-a}\right)$$

$$d = R \cdot c$$

Estimated Time of Arrival (ETA) in minutes:

$$\text{ETA} = \left\lceil \frac{d}{v_{\text{unit}}} \times 60 \right\rceil + T_{\text{turnout}}$$

where $v_{\text{unit}}$ is unit velocity (Medical: 25 km/h, Fire: 20 km/h, Buggy: 15 km/h) and $T_{\text{turnout}} = 1\text{ min}$.

---

### CHAPTER 4: TESTING, VALIDATION & RESULTS

| Test Case ID | Test Description | Input Data | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Student SOS Submission | Type: "Medical", "Student collapsed unconscious not breathing", People: 1 | Severity &ge; 9.0 (High), summary generated, nearest medic alerted | **PASS** |
| **TC-02** | Mass Casualty Fire | Type: "Fire", "Chemical explosion in lab", People: 20 | Severity = 10.0 (High), Fire squad given priority | **PASS** |
| **TC-03** | Low Routine Request | Type: "General", "Lost wallet near cafeteria", People: 1 | Severity &le; 2.5 (Low), no emergency siren | **PASS** |
| **TC-04** | Haversine Ordering | Incident at (12.972, 77.594); Responders at 150m and 900m | 150m unit ranked #1 with lowest ETA | **PASS** |
| **TC-05** | Role-Based Security | Student tries accessing `/admin/dashboard` | HTTP 302 / Flash error "Administrator clearance required" | **PASS** |
| **TC-06** | Responder Status Sync | Responder sets status to "Busy" | Unit excluded from auto-dispatch recommendation | **PASS** |

---

### CHAPTER 5: CONCLUSION & FUTURE ENHANCEMENTS

The Context-Aware AI Campus Emergency Orchestration System successfully proves that lightweight, non-hardware machine learning and rule-based NLP can drastically reduce emergency triage latency from minutes to milliseconds on educational campuses. 

**Future Roadmap:**
1. Real-time WebSocket streaming for live responder GPS tracking on interactive campus maps.
2. WebRTC voice memo transcription for audio emergency reporting.
3. Automated integration with campus IoT sirens and electronic access turnstiles.
