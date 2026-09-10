# MedExplain AI — Clinical Laboratory & Medical Report Intelligence

MedExplain AI is a patient-centered medical report explanation application designed to transform complex laboratory findings, diagnostic values, and metabolic panels into calm, clear, and educational insights.

Built with a modern **Bento Grid** interface, the application emphasizes patient reassurance, clear reference-range categorization, doctor-visit preparation, and multi-lingual accessibility.

---

## 🌟 Key Features

- **Bento Grid Architecture**: High-contrast, modular UI featuring dark slate foundations, glowing teal clinical accents, and responsive bento tiles.
- **Document & Lab Ingestion**: Support for PDF documents and medical images (JPG, PNG) with automated OCR and structured finding extraction.
- **Biomarker Classification**: Instant categorization across **Normal**, **Low**, **High**, and **Critical** reference ranges without alarming language.
- **Clinical AI Reasoning**:
  - Executive patient-friendly summaries.
  - Test-by-test plain language explanations.
  - Possible health significance and contextual factors.
  - Tailored questions to discuss with healthcare providers.
- **Multi-Lingual Clarity**: Full support for 11 languages with automatic RTL layout switching for Arabic:
  - English, Spanish, French, German, Mandarin Chinese, Hindi, Arabic (RTL), Portuguese, Russian, Japanese, and Korean.
- **Interactive Medical Chat**: Context-aware clinical assistant grounded in the uploaded report findings with source references.
- **Authentication & Security**: Firebase Auth integration with email/password and Google Sign-In, plus a frictionless offline demo mode.

---

## 🔑 Environment Variables & API Keys

To configure MedExplain AI for local development, production, or cloud deployment, create a `.env` file based on `.env.example`.

### Required & Optional API Keys

| Variable | Required | Description | Example / Format |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key used for clinical reasoning, document extraction, and translation. | `AIzaSy...` |
| `APP_URL` | Optional | The base URL where the application or preview is hosted. | `https://your-domain.com` |
| `VITE_API_URL` | Optional | Custom backend API microservice endpoint (defaults to `/api` proxy). | `http://localhost:8080` |
| `VITE_FIREBASE_API_KEY` | Optional | Firebase Web API key for patient authentication. *(Runs in demo auth if omitted)* | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Optional | Firebase Authentication domain. | `project-id.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Firebase Project ID. | `medexplain-ai` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Optional | Firebase Storage Bucket. | `project-id.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Optional | Firebase Cloud Messaging Sender ID. | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Optional | Firebase Web Application ID. | `1:123456789012:web:abcdef` |

### Sample `.env` Configuration

```env
# Google Gemini AI Key (Server-side)
GEMINI_API_KEY="your-gemini-api-key-here"

# Application URL
APP_URL="http://localhost:3000"

# Backend Microservice Route (optional)
VITE_API_URL="http://localhost:8080"

# Firebase Client Configuration (optional for Auth)
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="medexplain-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="medexplain-app"
VITE_FIREBASE_STORAGE_BUCKET="medexplain-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
```

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 + Lucide Icons + Bento Grid Layout Design
- **Routing**: React Router DOM v7
- **State & Storage**: React Context + Session/LocalStorage Caching
- **Auth**: Firebase Auth SDK (Google & Email/Password) with fallback Demo Auth
- **AI & Reasoning**: Google GenAI (`@google/genai`) and RAG medical knowledge retrieval

---

## 📁 Project Structure

```text
├── .env.example              # Environment variables template
├── metadata.json             # Applet capabilities & metadata
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite & Tailwind build configuration
├── src/
│   ├── api/                  # API clients, analysis endpoints & storage
│   │   ├── client.ts         # Centralized fetch wrapper & error handling
│   │   ├── analysis.ts       # Report normalization & finding explanation
│   │   ├── chat.ts           # Context-aware clinical chat requests
│   │   ├── demo.ts           # Demo report generation & mock data
│   │   ├── health.ts         # Backend service diagnostics
│   │   ├── storage.ts        # Local session report persistence
│   │   ├── translate.ts      # Multi-lingual translation requests
│   │   └── upload.ts         # File validation and upload handling
│   ├── auth/                 # Authentication context & Firebase setup
│   │   ├── AuthContext.tsx   # User session provider
│   │   ├── ProtectedRoute.tsx# Route guard
│   │   └── firebase.ts       # Firebase SDK initialization
│   ├── components/           # Reusable Bento UI components
│   │   ├── layout/           # Sidebar, Navbar, and Page wrappers
│   │   ├── report/           # Findings cards, stat counters & question drawers
│   │   └── ui/               # Bento buttons, cards, toasts & modals
│   ├── context/              # Toast & Global app state
│   ├── pages/                # Main application views
│   │   ├── Dashboard.tsx     # Bento overview & recent reports
│   │   ├── Upload.tsx        # Document drag & drop upload pipeline
│   │   ├── Report.tsx        # Detailed laboratory report view & findings
│   │   ├── Chat.tsx          # AI medical question assistant
│   │   ├── History.tsx       # Past report archive
│   │   ├── Settings.tsx      # Language selector & system diagnostics
│   │   ├── Login.tsx         # Patient sign-in
│   │   └── Register.tsx      # Patient registration
│   ├── types/                # TypeScript data schemas & enums
│   └── main.tsx              # Application entry point
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and provide your `GEMINI_API_KEY`:

```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build
```

---

## ⚕️ Medical Disclaimer

MedExplain AI is developed strictly for **educational and informational purposes**. It does not provide medical diagnoses, treatment recommendations, or clinical prescriptions. Patients should always review lab findings, abnormal values, and critical results with a licensed healthcare professional or physician.
