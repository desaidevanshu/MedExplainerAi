import { apiRequest } from './client';
import { Report } from '../types';

const REPORTS_STORAGE_KEY = 'medexplain_saved_reports';
const ACTIVE_REPORT_KEY = 'medexplain_active_report';

export function saveReportToLocalHistory(report: Report): void {
  try {
    const stored = getLocalReportHistory();
    // Filter out previous version of this report if already exists
    const filtered = stored.filter((r) => r.report_id !== report.report_id);
    const updated = [report, ...filtered].slice(0, 20); // Keep last 20
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
    setActiveReport(report);
  } catch (err) {
    console.warn('Could not persist report to local storage:', err);
  }
}

export function getLocalReportHistory(): Report[] {
  try {
    const item = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (item) {
      return JSON.parse(item);
    }
  } catch (err) {
    console.warn('Error reading reports from local storage:', err);
  }
  return [];
}

export function getReportById(reportId: string): Report | null {
  try {
    // First check active report
    const active = getActiveReport();
    if (active && active.report_id === reportId) {
      return active;
    }
    // Then check history
    const all = getLocalReportHistory();
    const found = all.find((r) => r.report_id === reportId);
    if (found) return found;
  } catch (err) {
    console.warn('Error finding report by id:', err);
  }
  return null;
}

export function setActiveReport(report: Report | null): void {
  try {
    if (report) {
      sessionStorage.setItem(ACTIVE_REPORT_KEY, JSON.stringify(report));
    } else {
      sessionStorage.removeItem(ACTIVE_REPORT_KEY);
    }
  } catch (err) {
    console.warn('Could not set active report:', err);
  }
}

export function getActiveReport(): Report | null {
  try {
    const item = sessionStorage.getItem(ACTIVE_REPORT_KEY);
    if (item) {
      return JSON.parse(item);
    }
  } catch (err) {
    console.warn('Could not read active report:', err);
  }
  return null;
}

export function clearLocalReports(): void {
  try {
    localStorage.removeItem(REPORTS_STORAGE_KEY);
    sessionStorage.removeItem(ACTIVE_REPORT_KEY);
  } catch (err) {
    console.warn('Could not clear local reports:', err);
  }
}

export async function fetchCloudReportHistory(): Promise<Report[]> {
  try {
    return await apiRequest<Report[]>('/api/history');
  } catch (err) {
    console.warn('Failed to fetch history from cloud:', err);
    return [];
  }
}

export async function fetchCloudReportById(id: string): Promise<Report | null> {
  try {
    return await apiRequest<Report>(`/api/history/${id}`);
  } catch (err) {
    console.warn(`Failed to fetch report ${id} from cloud:`, err);
    return null;
  }
}
