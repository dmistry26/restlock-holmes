import { MysteryState } from './types';
import { MysteryDefinition, getRandomMystery } from './mysteries';

// In-memory storage for active mysteries
// In production, you'd use a database
class MysteryStore {
  private activeMysteries: Map<string, MysteryState> = new Map();
  private readonly MAX_ATTEMPTS = 5;

  createMystery(difficulty?: 'easy' | 'medium' | 'hard'): MysteryState {
    const mysteryDef = getRandomMystery(difficulty);

    const state: MysteryState = {
      mystery: mysteryDef.mystery,
      answer: mysteryDef.answer,
      hints: mysteryDef.hints,
      hintsUsed: 0,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      solved: false,
      startedAt: new Date().toISOString()
    };

    this.activeMysteries.set(mysteryDef.mystery.mysteryId, state);
    return state;
  }

  getMystery(mysteryId: string): MysteryState | undefined {
    return this.activeMysteries.get(mysteryId);
  }

  useHint(mysteryId: string): boolean {
    const state = this.activeMysteries.get(mysteryId);
    if (!state) return false;

    if (state.hintsUsed < state.hints.length) {
      state.hintsUsed++;
      return true;
    }
    return false;
  }

  submitAnswer(mysteryId: string, answer: string): { correct: boolean; state: MysteryState } {
    const state = this.activeMysteries.get(mysteryId);
    if (!state) {
      throw new Error('Mystery not found');
    }

    state.attempts++;

    // For dynamic answers, we accept any non-empty answer as correct
    // In a real implementation, you'd validate against the actual API
    const isCorrect = state.answer === 'dynamic'
      ? answer.length > 0 && /^\d+$/.test(answer)
      : answer === state.answer;

    if (isCorrect) {
      state.solved = true;
      state.solvedAt = new Date().toISOString();
    }

    return { correct: isCorrect, state };
  }

  deleteMystery(mysteryId: string): boolean {
    return this.activeMysteries.delete(mysteryId);
  }

  // Helper to calculate time to solve
  getTimeToSolve(startedAt: string, solvedAt: string): string {
    const start = new Date(startedAt).getTime();
    const end = new Date(solvedAt).getTime();
    const diffMs = end - start;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Singleton instance
export const store = new MysteryStore();
