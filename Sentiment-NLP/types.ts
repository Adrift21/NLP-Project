
export enum SentimentType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL'
}

export interface SentimentResult {
  sentiment: SentimentType;
  confidence: number;
  explanation: string;
  keywords: string[];
}

export interface AnalysisRecord extends SentimentResult {
  id: string;
  text: string;
  timestamp: number;
}

export interface DashboardStats {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  averageConfidence: number;
}
