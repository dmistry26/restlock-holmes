/**
 * Vitest Unit Tests for Mystery 001: The Evolved Enigma
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:5173';
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

interface TestResult {
	clueId: string;
	answer: string;
	correct: boolean;
	message: string;
}

describe('Mystery 001: The Evolved Enigma', () => {
	let mystery: any;
	let results: TestResult[] = [];

	beforeAll(async () => {
		// Get the mystery
		const mysteryRes = await fetch(`${BASE_URL}/mystery?mysteryId=myst_001`);
		mystery = await mysteryRes.json();
	});

	it('should fetch the mystery successfully', () => {
		expect(mystery).toBeDefined();
		expect(mystery.mysteryId).toBe('myst_001');
		expect(mystery.title).toBeDefined();
		expect(mystery.scenario).toBeDefined();
		expect(mystery.currentClue).toBeDefined();
	});

	it('should solve clue 1: find rock-type Pokemon ending in "dore" with 7 letters', async () => {
		// Fetch rock-type Pokemon
		const rockTypeRes = await fetch(`${POKEAPI_BASE}/type/rock`);
		const rockTypeData = await rockTypeRes.json();

		// Find Pokemon ending in 'dore' with 7 letters
		const rockPokemon = rockTypeData.pokemon.map((p: any) => p.pokemon.name);
		const dorePokemons = rockPokemon.filter(
			(name: string) => name.endsWith('dore') && name.length === 7
		);

		expect(dorePokemons).toContain('boldore');
		const answer1 = dorePokemons[0];

		// Submit answer
		const submitRes = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: answer1
			})
		});

		const submitData = await submitRes.json();
		results.push({
			clueId: mystery.currentClue.id,
			answer: answer1,
			correct: submitData.correct,
			message: submitData.message
		});

		expect(submitData.correct).toBe(true);
		expect(submitData.nextClue).toBeDefined();
	});

	it('should solve clue 2: count game_indices for Boldore', async () => {
		// Get the next clue from previous submission
		const prevSubmitRes = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: 'boldore'
			})
		});
		const prevSubmitData = await prevSubmitRes.json();
		const clue2 = prevSubmitData.nextClue;

		expect(clue2).toBeDefined();

		// Get Boldore details
		const boldoreRes = await fetch(`${POKEAPI_BASE}/pokemon/boldore`);
		const boldoreData = await boldoreRes.json();

		// Count game_indices
		const gameIndicesCount = boldoreData.game_indices.length;
		const answer2 = gameIndicesCount.toString();

		expect(gameIndicesCount).toBeGreaterThan(0);

		// Submit answer
		const submitRes = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: clue2.id,
				answer: answer2
			})
		});

		const submitData = await submitRes.json();
		results.push({
			clueId: clue2.id,
			answer: answer2,
			correct: submitData.correct,
			message: submitData.message
		});

		expect(submitData.correct).toBe(true);
		expect(submitData.nextClue).toBeDefined();
	});

	it('should solve clue 3: multiply game_indices count by HP stat', async () => {
		// Re-submit previous answers to get to clue 3
		await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: 'boldore'
			})
		});

		const clue2Res = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: 'boldore'
			})
		});
		const clue2Data = await clue2Res.json();

		// Get Boldore data
		const boldoreRes = await fetch(`${POKEAPI_BASE}/pokemon/boldore`);
		const boldoreData = await boldoreRes.json();

		const gameIndicesCount = boldoreData.game_indices.length;

		const boldoreRes2 = await fetch(`${POKEAPI_BASE}/pokemon/boldore`);
		const boldoreData2 = await boldoreRes2.json();

		const submitRes2 = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: clue2Data.nextClue.id,
				answer: gameIndicesCount.toString()
			})
		});
		const submitData2 = await submitRes2.json();
		const clue3 = submitData2.nextClue;

		expect(clue3).toBeDefined();

		// Find HP stat
		const hpStat = boldoreData2.stats.find((s: any) => s.stat.name === 'hp');
		const hpValue = hpStat.base_stat;

		expect(hpValue).toBeGreaterThan(0);

		// Multiply game indices count by HP
		const finalAnswer = (gameIndicesCount * hpValue).toString();

		// Submit final answer
		const submitRes = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: clue3.id,
				answer: finalAnswer
			})
		});

		const submitData = await submitRes.json();
		results.push({
			clueId: clue3.id,
			answer: finalAnswer,
			correct: submitData.correct,
			message: submitData.message
		});

		expect(submitData.correct).toBe(true);
		expect(submitData.mysterySolved).toBe(true);
		expect(submitData.conclusion).toBeDefined();
	});

	it('should have all clues marked as correct', () => {
		expect(results.length).toBe(3);
		expect(results.every((r) => r.correct)).toBe(true);
	});
});
