export interface Clause {
  id: string;
  title: string;
  text: string;
  explanation: string;
}

export interface Contract {
  id: string;
  name: string;
  parties: string;
  address: string;
  signedDate: string;
  clauses: Clause[];
}

export interface LegalBasis {
  id: string;
  law: string;
  article: string;
  text: string;
}

export interface NegotiationScript {
  tone: string;
  text: string;
}

export interface DiffSegment {
  type: string;
  text: string;
}

export interface RiskItem {
  id: string;
  clauseId: string;
  clauseTitle: string;
  clauseText: string;
  riskType: string;
  level: string;
  title: string;
  reason: string;
  consequence: string;
  suggestion: string;
  revisedClause: string;
  legalBasisIds: string[];
  negotiation: NegotiationScript[];
  scoreImpact: number;
}

export interface CategoryScore {
  name: string;
  score: number;
}

export interface AnalysisResult {
  contractId: string;
  contractName: string;
  analyzedAt: string;
  source: string;
  overallScore: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  summary: string;
  categoryScores: CategoryScore[];
  risks: RiskItem[];
}

export interface HistoryRecord {
  id: string;
  contractName: string;
  analyzedAt: string;
  score: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}