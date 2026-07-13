# Barangay e-Document Management System (v2)

Welcome to the **Barangay e-Document Management System (v2)**—a secure, responsive, and modern platform designed to automate and digitize citizen services, youth (SK) initiatives, community complaints, and administrative operations.

The repository is organized as a monorepo split into two primary components:
1. **`frontend/`**: The client-side application built with Vue 3 and Bootstrap 5.
2. **`backend/`**: The newly initialized Node.js Express API service powered by the Firebase Admin SDK.

---

## 📂 Repository Directory Layout

```text
Barangay-e-Document-Management-System-v2/
├── frontend/               # Vue.js 3 Web Client
│   ├── src/                # Component layers (admin, official, resident)
│   ├── public/             # Static web assets
│   ├── package.json        # Frontend scripts and modules
│   └── README.md           # Frontend-specific documentation
│
├── backend/                # Express.js REST API
│   ├── src/                # Controller, middleware, route, and config folders
│   └── package.json        # Backend scripts and dependencies
│
└── README.md               # Main repository documentation (this file)
```

---

## 🌟 Current System State & Completed Features

We have successfully refined the system's core capabilities and aligned the user interface with downloaded deliverables. Here is the active feature set of the system today:

### 1. Unified Certificate Layouts (Print, PDF, and DOCX)
* **Design Synchronization:** The templates for Barangay Clearance and Certificates of Indigency look identical across web view, printing, PDF generation (via jsPDF), and Microsoft Word (DOCX) downloads.
* **Double-Border Frames:** Configured matching blue double-outer and single-inner borders to enclose the document content elegantly.

### 2. High-Fidelity Word (DOCX) Export Setup
* **Strict Dashed Circular Seal:** Word HTML parsers do not support CSS circular border properties (`border-radius`). To bypass this, the system dynamically draws the official dry seal warning text inside a dashed circle on an HTML5 canvas at runtime, exporting it as an embedded, high-quality base64 PNG. This guarantees the seal displays as a **perfect dashed circle** in Word.
* **Even Signature Layouts:** Aligned the vertical height of the signature block (`85px`) to sit level with the Captain's signature line on the left.
* **A4 Canvas Constraints (Single-Page Fitting):** Set Word page margins to `28pt` and resized the inner frame to `539pt` wide by `710pt` high. Coupled with a shortened `50pt` height spacer, this mathematically fits the certificate onto **exactly one page** on A4 paper with zero overflow.
* **Permanently Suppressed Gridlines:** Standardized tables with the `no-border` class, injecting `border: none !important;` and `mso-border-alt: none !important;` to fully disable Word's default black gridlines.

### 3. Granular Role-Based Dashboards
* **Super Admin / Chairman Portal:** Supports user account provisioning, system maintenance mode toggle, database exports (XLSX), and real-time SVG charting of resident statistics.
* **Official & Staff Hub:** Provides approval pathways for clearance request queues, incident report tracking, and certificate generators.
* **Resident Portal:** Citizen interface to request clearances, track status timelines, and re-upload registration documents.

### 4. Fully Initialized Backend (Express & Firebase Admin)
* **Modular Codebase:** Developed folders for `config/`, `controllers/`, `routes/`, `middleware/`, and `utils/`.
* **Secured API Endpoints:** Protected route groups by verifying Firebase client ID tokens against the Firebase Admin SDK.
* **Mock Environment Fallback:** If firebase keys are absent during development, the backend automatically transitions to offline/mock mode to prevent server startup errors.

---

## 🚀 Quick Start Guide

### 💻 1. Running the Frontend
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run serve
   ```
4. Access the web app at `http://localhost:8080/`.

### ⚙️ 2. Running the Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Put your Firebase Service Account JSON file in `src/config/serviceAccountKey.json`.
4. Run in development mode:
   ```bash
   npm run dev
   ```
5. The API will listen at `http://localhost:5000/`.
