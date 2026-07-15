export interface QAPair {
  question: string;
  answer: string;
  context?: string;
  timestamp: string;
}

export interface ConceptRequest {
  concept: string;
  level: 'elementary' | 'high_school' | 'college' | 'educator';
}

export interface ConceptResponse {
  concept: string;
  level: string;
  explanation: string;
  analogies: string[];
  keyTerms: { term: string; definition: string }[];
  summary: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
}

export interface QuizResponse {
  topic: string;
  questions: QuizQuestion[];
}

export interface SummarizeRequest {
  text: string;
  length: 'short' | 'medium' | 'detailed';
  format: 'bullets' | 'structured' | 'mindmap';
}

export interface SummarizeResponse {
  summary: string;
  keyTakeaways: string[];
  keyTerms: { term: string; definition: string }[];
}

export interface LearningPathRequest {
  topic: string;
  timeCommitment: string; // e.g., "5 hours/week", "2 weeks total"
}

export interface PathStage {
  title: string;
  description: string;
  duration: string;
  topics: string[];
  tips: string[];
  recommendedResources: string[];
}

export interface LearningPathResponse {
  topic: string;
  overview: string;
  stages: {
    beginner: PathStage;
    intermediate: PathStage;
    advanced: PathStage;
  };
}
