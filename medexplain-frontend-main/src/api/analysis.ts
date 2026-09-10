import { apiRequest } from './client';
import { Report, ExplainRequest, ExplainResponse, FindingStatus } from '../types';

export function normalizeReport(raw: any): Report {
  const statistics = raw.statistics || {
    total: 0,
    normal: 0,
    low: 0,
    high: 0,
    critical: 0,
    unknown: 0,
  };

  const rawFindings = Array.isArray(raw.findings) ? raw.findings : [];
  const findings = rawFindings.map((f: any) => {
    let status: FindingStatus = 'UNKNOWN';
    const rawStatus = (f.status || '').toString().toUpperCase();
    if (rawStatus.includes('NORMAL')) status = 'NORMAL';
    else if (rawStatus.includes('CRITICAL')) status = 'CRITICAL';
    else if (rawStatus.includes('HIGH')) status = 'HIGH';
    else if (rawStatus.includes('LOW')) status = 'LOW';
    else status = 'UNKNOWN';

    return {
      name: f.name || f.test_name || 'Laboratory Test',
      value: f.value !== undefined ? f.value : f.result,
      unit: f.unit || '',
      reference_range: f.reference_range || f.range || f.normal_range || '',
      status,
      explanation: f.explanation || f.meaning || '',
      possible_significance: f.possible_significance || f.significance || '',
      doctor_questions: Array.isArray(f.doctor_questions) ? f.doctor_questions : (f.questions ? [f.questions].flat() : []),
      sources: Array.isArray(f.sources) ? f.sources : [],
    };
  });

  // Calculate stats if missing or zeroes while findings exist
  if (findings.length > 0 && statistics.total === 0) {
    statistics.total = findings.length;
    statistics.normal = findings.filter((f: any) => f.status === 'NORMAL').length;
    statistics.low = findings.filter((f: any) => f.status === 'LOW').length;
    statistics.high = findings.filter((f: any) => f.status === 'HIGH').length;
    statistics.critical = findings.filter((f: any) => f.status === 'CRITICAL').length;
    statistics.unknown = findings.filter((f: any) => f.status === 'UNKNOWN').length;
  }

  return {
    report_id: raw.report_id || raw.id || 'rep-' + Math.random().toString(36).substring(2, 9),
    file_id: raw.file_id,
    filename: raw.filename || 'Medical Report',
    extraction_method: raw.extraction_method || 'pdf_text',
    extraction_confidence: typeof raw.extraction_confidence === 'number' ? raw.extraction_confidence : 0.95,
    summary: raw.summary || 'Summary of medical findings and laboratory observations.',
    overall_outcome: raw.overall_outcome || raw.overall_assessment || '',
    statistics,
    findings,
    sources: Array.isArray(raw.sources) ? raw.sources : [],
    disclaimer: raw.disclaimer || 'MedExplain AI provides educational information and does not replace professional medical advice.',
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export const analyzeReportFile = async (file_id: string, language: string = 'en', target_report?: string): Promise<Report> => {
  const req = { file_id, language, target_report };
  const raw = await apiRequest<any>('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return normalizeReport(raw);
}

export async function explainFinding(reportId: string, findingName: string): Promise<ExplainResponse> {
  return apiRequest<ExplainResponse>('/api/explain', {
    method: 'POST',
    body: JSON.stringify({
      report_id: reportId,
      finding_name: findingName,
    } as ExplainRequest),
  });
}
