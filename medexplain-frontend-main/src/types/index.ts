export type FindingStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export interface Source {
  title?: string;
  name?: string;
  url?: string;
  source?: string;
  snippet?: string;
  description?: string;
}

export interface Finding {
  name: string;
  section?: string;
  value?: number | string;
  unit?: string;
  reference_range?: string;
  status: FindingStatus;
  explanation?: string;
  possible_significance?: string;
  doctor_questions?: string[];
  sources?: Source[];
}

export interface ReportStatistics {
  total: number;
  normal: number;
  low: number;
  high: number;
  critical: number;
  unknown: number;
}

export interface Report {
  report_id: string;
  file_id?: string;
  filename?: string;
  extraction_method?: 'pdf_text' | 'ocr' | 'demo' | string;
  extraction_confidence?: number;
  summary?: string;
  overall_outcome?: string;
  statistics: ReportStatistics;
  findings: Finding[];
  sources?: Source[];
  disclaimer?: string;
  created_at?: string;
  language?: string;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  status: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | string;
  service?: string;
  llm?: 'connected' | 'disconnected' | string;
  rag?: 'ready' | 'not_ready' | string;
  ocr?: 'available' | 'unavailable' | string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: Source[];
  timestamp: string;
  report_id?: string;
}

export interface ChatRequest {
  question: string;
  report_id?: string;
  language?: string;
  history?: Array<{
    role: 'user' | 'assistant';
    text: string;
  }>;
}

export interface ChatResponse {
  answer: string;
  sources?: Source[];
}

export interface ExplainRequest {
  report_id: string;
  finding_name: string;
}

export interface ExplainResponse {
  finding_name?: string;
  explanation: string;
  possible_significance?: string;
  doctor_questions?: string[];
  sources?: Source[];
}

export interface TranslateRequest {
  text: string;
  language: string;
}

export interface TranslateResponse {
  translated_text: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}
