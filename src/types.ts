export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Clue {
  id: string;
  text: string;
  apiHint: string;
  solved?: boolean;
}

export interface Mystery {
  mysteryId: string;
  title: string;
  difficulty: Difficulty;
  scenario: string;
  clues: Clue[];
  hintsAvailable: number;
  createdAt: string;
}

export interface Hint {
  mysteryId: string;
  hint: string;
}

export interface SubmitRequest {
  mysteryId: string;
  answer: string;
}

export interface SubmitResponse {
  correct: boolean;
  message: string;
  mysteryId: string;
  solvedAt?: string;
  nextMysteryAvailable?: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// Internal type for loaded mysteries
export interface MysteryData {
  id: string;
  title: string;
  difficulty: Difficulty;
  scenario: string;
  clues: Array<{
    id: string;
    text: string;
    apiHint: string;
  }>;
  answer: string;
  hints: string[];
}
