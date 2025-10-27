export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Clue {
  id: string;
  text: string;
  apiHint: string;
  hintsAvailable: number;  // Number of hints available for this clue
}

export interface Mystery {
  mysteryId: string;
  title: string;
  difficulty: Difficulty;
  scenario: string;
  currentClue: Clue;  // Only show the current clue
  currentClueIndex: number;
  totalClues: number;
  createdAt: string;
}

export interface Hint {
  mysteryId: string;
  clueId: string;
  hint: string;
}

export interface SubmitRequest {
  mysteryId: string;
  clueId: string;
  answer: string;
}

export interface SubmitResponse {
  correct: boolean;
  message: string;
  mysteryId: string;
  clueId: string;
  nextClue?: Clue;
  mysterySolved?: boolean;
  conclusion?: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// Internal type for loaded mysteries from YAML
export interface MysteryData {
  id: string;
  title: string;
  difficulty: Difficulty;
  scenario: string;
  clues: Array<{
    id: string;
    text: string;
    apiHint: string;
    answer: string;
    hints: string[];  // Hints for this specific clue
  }>;
  conclusion: string;
}
