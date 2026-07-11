# Barangay e-Document Management System (v2)

A state-of-the-art, secure, and reactive web platform designed to digitize and automate barangay-level operations. Built on **Vue 3**, **Bootstrap 5**, and a hybrid data layer (**Firebase** & **Local JSON Database**), the system streamlines public service requests, community complaints, youth initiatives, and administrative oversight.

---

## 🌟 Project Highlights

- **Dual-Engine Architecture:** Seamlessly switches between a real-time Cloud Firebase setup and a robust offline local storage backup (`localDb.js` / `local.json`) without degrading user experience.
- **Granular Role-Based Access Control (RBAC):** Tailored views, navigation sidebars, and dashboards for Residents, SK Officials, Barangay Staff/Officials, and Super Admins.
- **Intelligent Assistant:** Features a built-in AI Chatbot powered by the Cohere API to guide residents on requirements and procedures.
- **Rich Analytics & Data Export:** Visual representation of user roles, request statuses, and resident demographics using custom charts (SVG-based and Chart.js), with native Excel (XLSX) exporting capabilities.
- **System Maintenance Gatekeeper:** A global toggle to place the site under maintenance, showing users a custom explanation and estimated completion time.

---

## 👥 User Roles & Features

### 🏢 1. Super Admin (Barangay Chairman Portal)
The ultimate administration panel to monitor users, analyze analytics, and configure system flags:
- **Comprehensive User Management:** Filter, search, and manage all accounts. Supports bulk approval and deletion.
- **Staff Provisioning:** Securely create official Barangay Staff and Official accounts with default passwords.
- **System Maintenance Toggle:** Put the entire app under maintenance dynamically, with a custom completion countdown.
- **Dynamic Chart Analytics:** High-level SVG-rendered bar and doughnut charts displaying user role distributions and resident statuses.
- **Audit Logs & Data Export:** Export the entire user directory and transaction logs to Excel spreadsheets (XLSX).

### 📋 2. Barangay Officials & Staff Dashboard
The operational hub for processing citizen documents and public requests:
- **Document Request Processing:** Review, approve, reject (with feedback), or tag clearance requests as claimed.
- **Complaints & Incident Management:** Address community reports (e.g., noise complaints, hazard reports). Change statuses from *Pending* to *In Progress* or *Resolved* with resolution notes.
- **Printable Certificate Generator:** Generate custom certificates (Clearance, Indigency - Financial, Indigency - General) via PDF previews and pre-configured templates.
- **Resident Directory Management:** Review resident profiles, view uploaded IDs, verify compliance, or request ID re-submission.

### 🏠 3. Residents Portal
A citizen-facing application to access services and report issues:
- **Service & Document Requests:** Apply online for Barangay Clearances and Certificates of Indigency.
- **Real-Time Application Tracking:** Monitor status (`Pending`, `Approved`, `Claimed`, or `Rejected`) with timeline visualizations and pick-up instructions.
- **Complaint Submission:** Report neighborhood complaints or safety concerns (starts with `RPT-` tracking IDs).
- **ID Re-upload Workflow:** If flagged for "Compliance Required", residents can drag and drop a new valid ID directly from their dashboard.


---

## 🛠️ Technology Stack

- **Frontend Core:** [Vue.js 3](https://vuejs.org/) (Composition API, Vue Router, Vuex)
- **Styling:** Bootstrap 5, FontAwesome Icons, Custom Tailwind CSS integration
- **Database / Auth:** [Firebase v11](https://firebase.google.com/) (Firestore database, Firebase Authentication, Firebase Storage)
- **Offline Fallback Service:** Custom local database management wrapper (`localDb.js`)
- **PDF Generation:** [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html)
- **Excel Export:** [SheetJS (XLSX)](https://sheetjs.com/)
- **Charts Engine:** [Chart.js](https://www.chartjs.org/) & Custom SVG Chart components
- **AI Integration:** Cohere API (Chatbot integration)

---

## 📁 Key File Structure

```bash
src/
├── components/
│   ├── admin/             # Super Admin views (AdminDashboard, StaffAccountModal)
│   ├── official/          # Staff & Official views (ManageRequests, PrintableDocument)
│   ├── resident/          # Resident views (RequestForm, ResidentProfile, Settings)
│   ├── common/            # Shared components (NavBar, Footer, RealTimeClock)
│   ├── Chatbot.vue        # AI Chatbot assistant component
│   └── VerificationPage.vue # Multi-step resident registration verification
├── views/                 # Root pages (Home, Login, Register, Services, About)
├── services/
│   ├── localDb.js         # Local database controller (fallback to local.json)
│   └── notification.js    # In-app toast & push notification helper
├── firebase/
│   └── config.js          # Firestore/Auth initialization
├── store/
│   └── index.js           # Vuex state management
├── router/
│   └── index.js           # Vue Router config (Navigation guards & role verification)
└── App.vue                # Main application wrapper (Maintenance routing)
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v16.x or higher recommended).

### 2. Configure Environment Variables
Create a `.env` file in the root directory and configure the environment variables based on `.env.example`:
```env
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Install Dependencies
Run the following command in your terminal:
```bash
npm install
```

### 4. Running the Development Server
If you are on Windows and run into script execution restrictions, launch the server using `cmd.exe`:
```cmd
cmd.exe /c npm run serve
```
Alternatively, bypass the execution policy in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run serve"
```

Once started, the application will be available at:
- **Local URL:** `http://localhost:8080/`

### 5. Production Build
To build and optimize the application for production:
```bash
npm run build
```

---

## 🔒 Security & Verification Guards

- **Navigation Guarding:** Vue Router automatically verifies role permissions. Non-residents cannot access admin paths, and pending residents are redirected to a verification hold page.
- **Interactive Verification:** Residents must submit valid ID images upon registration. Staff manually verify documents before granting full access to system features.
