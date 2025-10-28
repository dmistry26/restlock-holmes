/**
 * Vitest Unit Tests for Mystery 003: The JSONPlaceholder Puzzle
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:5173';
const JSON_API_BASE = 'https://jsonplaceholder.typicode.com';

interface TestResult {
	clueId: string;
	answer: string;
	correct: boolean;
}

describe('Mystery 003: The JSONPlaceholder Puzzle', () => {
	let mystery: any;
	let results: TestResult[] = [];

	beforeAll(async () => {
		// Get the mystery with easy difficulty
		const mysteryRes = await fetch(`${BASE_URL}/mystery?mysteryId=myst_003`);
		const mysteryData = await mysteryRes.json();

		mystery = mysteryData;
	});

	it('should fetch the correct mystery (myst_003)', () => {
		expect(mystery).toBeDefined();
		expect(mystery.mysteryId).toBe('myst_003');
		expect(mystery.title).toBeDefined();
		expect(mystery.scenario).toBeDefined();
		expect(mystery.currentClue).toBeDefined();
	});

	it('should solve clue 1: get userId from post #50', async () => {
		const postRes = await fetch(`${JSON_API_BASE}/posts/50`);
		const postData = await postRes.json();

		expect(postData).toBeDefined();
		expect(postData.userId).toBeDefined();

		const answer1 = postData.userId.toString();

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

	it('should solve clue 2: get first name of user #5', async () => {
		// Re-submit clue 1 to get clue 2
		const postRes = await fetch(`${JSON_API_BASE}/posts/50`);
		const postData = await postRes.json();
		const answer1 = postData.userId.toString();

		const clue1Res = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: answer1
			})
		});
		const clue1Data = await clue1Res.json();
		const clue2 = clue1Data.nextClue;

		expect(clue2).toBeDefined();

		// Get user #5 data
		const userRes = await fetch(`${JSON_API_BASE}/users/5`);
		const userData = await userRes.json();

		expect(userData).toBeDefined();
		expect(userData.name).toBeDefined();

		const fullName = userData.name;
		const firstName = fullName.split(' ')[0];
		const answer2 = firstName;

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

	it('should solve clue 3: count letters in first name', async () => {
		// Re-submit clues 1 and 2 to get clue 3
		const postRes = await fetch(`${JSON_API_BASE}/posts/50`);
		const postData = await postRes.json();
		const answer1 = postData.userId.toString();

		await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: answer1
			})
		});

		const userRes = await fetch(`${JSON_API_BASE}/users/5`);
		const userData = await userRes.json();
		const fullName = userData.name;
		const firstName = fullName.split(' ')[0];
		const answer2 = firstName;

		const clue1Res = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: mystery.currentClue.id,
				answer: answer1
			})
		});
		const clue1Data = await clue1Res.json();

		const clue2Res = await fetch(`${BASE_URL}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mysteryId: mystery.mysteryId,
				clueId: clue1Data.nextClue.id,
				answer: answer2
			})
		});
		const clue2Data = await clue2Res.json();
		const clue3 = clue2Data.nextClue;

		expect(clue3).toBeDefined();

		// Calculate length of first name
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
