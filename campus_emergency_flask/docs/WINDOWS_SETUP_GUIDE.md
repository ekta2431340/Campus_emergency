# Windows Step-by-Step Setup Guide
## Context-Aware AI Campus Emergency Orchestration System

Follow these instructions to run the project cleanly on any Windows 10 or 11 laptop or desktop.

---

### STEP 1: Verify Python Installation
1. Press `Win + R`, type `cmd`, and press Enter.
2. In the Command Prompt, type:
   ```cmd
   python --version
   ```
   *You should see Python 3.10.x, 3.11.x, or 3.12.x.*
3. If Python is not recognized:
   - Download the latest Python installer from [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - **CRITICAL:** Check the box that says **"Add Python to PATH"** before clicking Install Now.

---

### STEP 2: Navigate to Project Folder
```cmd
cd path\to\campus_emergency_system
```

---

### STEP 3: Create & Activate Virtual Environment (Recommended)
Creating an isolated virtual environment prevents library conflicts:

#### In Command Prompt (cmd.exe):
```cmd
python -m venv venv
venv\Scripts\activate
```

#### In PowerShell:
*(If you see an Execution Policy error in PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*Your prompt will now show `(venv)`.*

---

### STEP 4: Install Dependencies
Run the standard pip installation command:
```cmd
pip install -r requirements.txt
```

---

### STEP 5: Launch the Application
Run the entry point script:
```cmd
python run.py
```

You will see:
```text
======================================================================
  CONTEXT-AWARE AI CAMPUS EMERGENCY ORCHESTRATION SYSTEM
  BCA Final-Year Capstone Project
  Server running locally at: http://127.0.0.1:5000
  Default Login Accounts:
    - Admin:     admin@campus.edu     / admin123
    - Student:   student@campus.edu   / student123
    - Responder: responder.fire@campus.edu / resp123
======================================================================
```

---

### STEP 6: Open in Browser
Open Google Chrome, Microsoft Edge, or Firefox and go to:
👉 **`http://127.0.0.1:5000`**

---

### 🔍 Troubleshooting Common Windows Issues

1. **Port 5000 is already in use:**
   If another application is using port 5000:
   ```cmd
   set PORT=5050
   python run.py
   ```
   Then visit `http://127.0.0.1:5050`.

2. **Resetting Database to Default Demo State:**
   If you ever want to wipe and re-seed the sample database with pristine demo records:
   ```cmd
   python seed_data.py
   ```

3. **Running the Automated Test Suite:**
   To test all functions and routes:
   ```cmd
   python -m unittest discover tests
   ```
