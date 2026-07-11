# Barangay e-Document System - Backend API

This is the backend API service for the Barangay e-Document Management System. It is built using Node.js, Express, and Firebase Admin SDK.

---

## 🛠️ Tech Stack
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database & Auth Admin SDK:** Firebase Admin SDK
* **Cross-Origin Requests:** CORS
* **Environment Variables:** Dotenv

---

## 📂 Project Structure
```text
backend/
├── src/
│   ├── config/          # Configuration keys and SDK setup (Firebase)
│   ├── controllers/     # Controller logic (Auth, Documents processing)
│   ├── middleware/      # Middleware interceptors (Auth token checks)
│   ├── routes/          # API route definitions
│   └── utils/           # Helper scripts (Logger, Mailers)
│   └── index.js         # Entry point script
├── .env                 # Server configuration settings
├── .gitignore           # Ignored files list
├── package.json         # NPM script actions and dependencies
└── README.md            # Backend documentation
```

---

## ⚙️ Installation & Setup

### 1. Install Dependencies
Change to the `backend` directory and run:
```bash
npm install
```

### 2. Configure Firebase Admin Account Key
To link the backend to your Firestore database and Firebase Authentication:
1. Go to your **Firebase Console** -> **Project Settings** -> **Service Accounts**.
2. Click **Generate New Private Key** to download the JSON credentials file.
3. Place this JSON file inside `backend/src/config/` and rename it to `serviceAccountKey.json`.

---

## 🚀 Running the Server

### Start in Production Mode
```bash
npm start
```

### Start in Development Mode (Hot Reloading via Nodemon)
```bash
npm run dev
```

The server will be available at:
* **Localhost URL:** `http://localhost:5000/`
