import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { MysteryData, Mystery } from './types';

class MysteryStore {
  private mysteries: MysteryData[] = [];

  constructor() {
    this.loadMysteries();
  }

  private loadMysteries() {
    const yamlPath = path.join(process.cwd(), 'mysteries.yaml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    const data = yaml.load(fileContents) as { mysteries: MysteryData[] };
    this.mysteries = data.mysteries;
    console.log(`✅ Loaded ${this.mysteries.length} mysteries from YAML`);
  }

  // Get a random mystery by difficulty (stateless)
  getRandomMystery(difficulty?: 'easy' | 'medium' | 'hard'): Mystery {
    const filtered = difficulty
      ? this.mysteries.filter(m => m.difficulty === difficulty)
      : this.mysteries;

    if (filtered.length === 0) {
      throw new Error('No mysteries found for the specified difficulty');
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const mysteryData = filtered[randomIndex];

    return {
      mysteryId: mysteryData.id,
      title: mysteryData.title,
      difficulty: mysteryData.difficulty,
      scenario: mysteryData.scenario,
      clues: mysteryData.clues.map(c => ({ ...c, solved: false })),
      hintsAvailable: mysteryData.hints.length,
      createdAt: new Date().toISOString()
    };
  }

  // Get a specific mystery by ID
  getMysteryById(mysteryId: string): MysteryData | undefined {
    return this.mysteries.find(m => m.id === mysteryId);
  }

  // Get a random hint for a mystery
  getRandomHint(mysteryId: string): string | null {
    const mystery = this.getMysteryById(mysteryId);
    if (!mystery || mystery.hints.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * mystery.hints.length);
    return mystery.hints[randomIndex];
  }

  // Check if an answer is correct (stateless)
  checkAnswer(mysteryId: string, answer: string): boolean {
    const mystery = this.getMysteryById(mysteryId);
    if (!mystery) {
      return false;
    }

    // For dynamic answers, we accept any non-empty numeric answer as correct
    // In a real implementation, you'd validate against the actual API
    if (mystery.answer === 'dynamic') {
      return answer.length > 0 && /^-?\d+$/.test(answer);
    }

    return answer === mystery.answer;
  }

  // Get all mysteries (for debugging/admin purposes)
  getAllMysteries(): MysteryData[] {
    return this.mysteries;
  }
}

// Singleton instance
export const store = new MysteryStore();
