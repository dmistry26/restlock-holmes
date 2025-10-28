/**
 * Vitest Unit Tests for Mystery 002: The Dog Breed Mystery
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:5173';
const DOG_API_BASE = 'https://dog.ceo/api';

interface TestResult {
	clueId: string;
	answer: string;
	correct: boolean;
}

describe('Mystery 002: The Dog Breed Mystery', () => {
	let mystery: any;
	let results: TestResult[] = [];

	beforeAll(async () => {
		// Get the mystery with easy difficulty
		const mysteryRes = await fetch(`${BASE_URL}/mystery?mysteryId=myst_002`);
		const mysteryData = await mysteryRes.json();
		mystery = mysteryData;
	});

	it('should fetch the correct mystery (myst_002)', () => {
		expect(mystery).toBeDefined();
		expect(mystery.mysteryId).toBe('myst_002');
		expect(mystery.title).toBeDefined();
		expect(mystery.scenario).toBeDefined();
		expect(mystery.currentClue).toBeDefined();
	});

	it('should solve clue 1: count hound sub-breeds', async () => {
		const breedsRes = await fetch(`${DOG_API_BASE}/breeds/list/all`);
		const breedsData = await breedsRes.json();

		expect(breedsData.message.hound).toBeDefined();
		const houndSubBreeds = breedsData.message.hound;
		expect(Array.isArray(houndSubBreeds)).toBe(true);

		const answer1 = houndSubBreeds.length.toString();

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
			correct: submitData.correct
		});

		expect(submitData.correct).toBe(true);
		expect(submitData.nextClue).toBeDefined();
	});

	it('should solve clue 2: find first hound sub-breed alphabetically', async () => {
		// Get hound sub-breeds again
		const breedsRes = await fetch(`${DOG_API_BASE}/breeds/list/all`);
		const breedsData = await breedsRes.json();
		const houndSubBreeds = breedsData.message.hound;

		// Re-submit clue 1 to get clue 2
		const clue1Res = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: houndSubBreeds.length.toString()
			})
		});
		const clue1Data = await clue1Res.json();
		const clue2 = clue1Data.nextClue;

		expect(clue2).toBeDefined();

		// Sort and get first alphabetically
		const sortedHounds = [...houndSubBreeds].sort();
		const answer2 = sortedHounds[0];

		expect(sortedHounds.length).toBeGreaterThan(0);

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
		results.push({ clueId: clue2.id, answer: answer2, correct: submitData.correct });

		expect(submitData.correct).toBe(true);
		expect(submitData.nextClue).toBeDefined();
	});

	it('should solve clue 3: count letters in the breed name', async () => {
		// Get hound sub-breeds
		const breedsRes = await fetch(`${DOG_API_BASE}/breeds/list/all`);
		const breedsData = await breedsRes.json();
		const houndSubBreeds = breedsData.message.hound;

		// Re-submit clues 1 and 2 to get clue 3
		await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: houndSubBreeds.length.toString()
			})
		});

		const sortedHounds = [...houndSubBreeds].sort();
		const answer2 = sortedHounds[0];

		const clue2Res = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: houndSubBreeds.length.toString()
			})
		});
		const clue2Data = await clue2Res.json();

		const submitClue2Res = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: clue2Data.nextClue.id,
				answer: answer2
			})
		});
		const submitClue2Data = await submitClue2Res.json();
		const clue3 = submitClue2Data.nextClue;

		expect(clue3).toBeDefined();

		// Calculate length of breed name
		const answer3 = answer2.length.toString();

		// Submit final answer
		const submitRes = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: clue3.id,
				answer: answer3
			})
		});

		const submitData = await submitRes.json();
		results.push({ clueId: clue3.id, answer: answer3, correct: submitData.correct });

		expect(submitData.correct).toBe(true);
		expect(submitData.mysterySolved).toBe(true);
		expect(submitData.conclusion).toBeDefined();
	});

	it('should have all clues marked as correct', () => {
		expect(results.length).toBe(3);
		expect(results.every((r) => r.correct)).toBe(true);
	});
});
