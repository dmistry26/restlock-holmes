import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import type { MysteryData, Mystery, Clue } from './types';

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

	// Get a mystery by ID or randomly by difficulty (returns only the first clue)
	getRandomMystery(difficulty?: 'easy' | 'medium' | 'hard', mysteryId?: string): Mystery {
		let mysteryData: MysteryData | undefined;

		// If mysteryId is specified, get that specific mystery
		if (mysteryId) {
			mysteryData = this.getMysteryById(mysteryId);
			if (!mysteryData) {
				throw new Error(`Mystery with ID '${mysteryId}' not found`);
			}
		} else {
			// Otherwise, get a random mystery by difficulty
			const filtered = difficulty
				? this.mysteries.filter((m) => m.difficulty === difficulty)
				: this.mysteries;

			if (filtered.length === 0) {
				throw new Error('No mysteries found for the specified difficulty');
			}

			const randomIndex = Math.floor(Math.random() * filtered.length);
			mysteryData = filtered[randomIndex];
		}

		// Return only the first clue
		const firstClue = mysteryData.clues[0];

		return {
			mysteryId: mysteryData.id,
			title: mysteryData.title,
			difficulty: mysteryData.difficulty,
			scenario: mysteryData.scenario,
			currentClue: {
				id: firstClue.id,
				text: firstClue.text,
				apiHint: firstClue.apiHint,
				hintsAvailable: firstClue.hints.length
			},
			currentClueIndex: 0,
			totalClues: mysteryData.clues.length,
			createdAt: new Date().toISOString()
		};
	}

	// Get a specific mystery by ID
	getMysteryById(mysteryId: string): MysteryData | undefined {
		return this.mysteries.find((m) => m.id === mysteryId);
	}

	// Get a specific clue by mystery ID and clue ID
	getClueById(
		mysteryId: string,
		clueId: string
	): { clue: MysteryData['clues'][0]; index: number } | null {
		const mystery = this.getMysteryById(mysteryId);
		if (!mystery) return null;

		const index = mystery.clues.findIndex((c) => c.id === clueId);
		if (index === -1) return null;

		return { clue: mystery.clues[index], index };
	}

	// Get the next clue
	getNextClue(mysteryId: string, currentClueId: string): Clue | null {
		const mystery = this.getMysteryById(mysteryId);
		if (!mystery) return null;

		const currentIndex = mystery.clues.findIndex((c) => c.id === currentClueId);
		if (currentIndex === -1 || currentIndex === mystery.clues.length - 1) {
			return null; // No next clue
		}

		const nextClue = mystery.clues[currentIndex + 1];
		return {
			id: nextClue.id,
			text: nextClue.text,
			apiHint: nextClue.apiHint,
			hintsAvailable: nextClue.hints.length
		};
	}

	// Get a hint by index for a specific clue (0-indexed)
	// Returns the first hint if index is undefined
	// Returns "No more hints." if index is out of bounds
	getHintByIndex(mysteryId: string, clueId: string, index?: number): string | null {
		const clueData = this.getClueById(mysteryId, clueId);
		if (!clueData || !clueData.clue.hints || clueData.clue.hints.length === 0) {
			return null;
		}

		// If no index provided, return the first hint
		if (index === undefined) {
			return clueData.clue.hints[0];
		}

		// If index is out of bounds, return "No more hints."
		if (index < 0 || index >= clueData.clue.hints.length) {
			return 'No more hints.';
		}

		return clueData.clue.hints[index];
	}

	// Check if an answer is correct for a specific clue
	checkAnswer(mysteryId: string, clueId: string, answer: string): boolean {
		const clueData = this.getClueById(mysteryId, clueId);
		if (!clueData) return false;

		const expectedAnswer = clueData.clue.answer;

		// Case-insensitive comparison for text answers
		return answer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();
	}

	// Check if this is the last clue
	isLastClue(mysteryId: string, clueId: string): boolean {
		const mystery = this.getMysteryById(mysteryId);
		if (!mystery) return false;

		const clueIndex = mystery.clues.findIndex((c) => c.id === clueId);
		return clueIndex === mystery.clues.length - 1;
	}

	// Get the conclusion
	getConclusion(mysteryId: string): string | null {
		const mystery = this.getMysteryById(mysteryId);
		return mystery?.conclusion ?? null;
	}

	// Get all mysteries (for debugging/admin purposes)
	getAllMysteries(): MysteryData[] {
		return this.mysteries;
	}
}

// Singleton instance
export const store = new MysteryStore();
