export interface Resume {
  id?: number;
  studentName: string;
  role: string;
  email: string;
  score: number;
  atsScore: number;
  keywordScore: number;
  formatScore: number;
  experienceScore: number;
  jdMatchScore: number;
  fileName: string;
  fileContentType: string;
  uploadTime: Date;
  feedback: string;
  skills: string;
  verdict: string;
  strengths: string;       // pipe‑separated: "Strength 1||Strength 2"
  weaknesses: string;
  missingKeywords: string;
  foundKeywords: string;
  sectionsJson: string;
  rewriteSuggestions: string;
  immediateActions: string;
  strategicActions: string;
  atsIssues: string;
  redFlags: string;
  summary: string;
}