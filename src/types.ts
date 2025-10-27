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
  hintLevel: number;
  hint: string;
  hintsRemaining: number;
}

export interface SubmitRequest {
  mysteryId: string;
  answer: string;
}

export interface SolveStats {
  timeToSolve: string;
  hintsUsed: number;
  attemptsUsed: number;
}

export interface SubmitResponse {
  correct: boolean;
  message: string;
  mysteryId: string;
  solvedAt?: string;
  nextMysteryAvailable?: boolean;
  attemptsRemaining?: number;
  stats?: SolveStats;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// Internal type for storing mystery state
export interface MysteryState {
  mystery: Mystery;
  answer: string; // The correct answer
  hints: string[]; // Array of hints (level 1, 2, 3)
  hintsUsed: number;
  attempts: number;
  maxAttempts: number;
  solved: boolean;
  startedAt: string;
  solvedAt?: string;
}
