import { Elysia, t } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { store } from './store';
import type { Mystery, Hint, ApiError, SubmitResponse } from './types';
function toCode(strings: TemplateStringsArray): string[] {
	const str = strings[0];
	const lines = str.split('\n');
	const length = Math.max(...lines.map((line) => line.length));
	return lines.map((line) => line.padEnd(length));
}
export default new Elysia()
	.use(
		openapi({
			documentation: {
				info: {
					title: 'API Mystery Hunt',
					version: '1.0.0',
					description: `An educational escape room API that teaches developers how to read documentation
and work with APIs through puzzle-solving. Solve mysteries by reading docs,
making API calls, and processing data programmatically.`
				},
				tags: [
					{
						name: 'Game',
						description: 'Core game mechanics for mystery solving'
					}
				]
			}
		})
	)

	// GET /mystery - Get a new mystery to solve
	.get(
		'/mystery',
		({ query, set }) => {
			try {
				const { difficulty } = query;

				// Validate difficulty if provided
				if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
					set.status = 400;
					return {
						error: 'InvalidDifficulty',
						message: "Difficulty must be 'easy', 'medium', or 'hard'"
					} satisfies ApiError;
				}

				// Get a random mystery (stateless)
				const mystery = store.getRandomMystery(
					difficulty as 'easy' | 'medium' | 'hard' | undefined
				);

				return mystery satisfies Mystery;
			} catch (error) {
				set.status = 500;
				return {
					error: 'InternalServerError',
					message: 'Failed to create mystery'
				} satisfies ApiError;
			}
		},
		{
			detail: {
				tags: ['Game'],
				summary: 'Get a new mystery to solve',
				description: `Retrieves a new mystery case with clues that point to external APIs.
Each mystery requires reading API documentation and writing code to solve.`
			},
			query: t.Object({
				difficulty: t.Optional(t.Union([t.Literal('easy'), t.Literal('medium'), t.Literal('hard')]))
			})
		}
	)

	// GET /hint - Get a hint for a specific clue
	.get(
		'/hint',
		({ query, set }) => {
			const { mysteryId, clueId, index } = query;

			if (!mysteryId || !clueId) {
				set.status = 400;
				return {
					error: 'MissingParameter',
					message: 'mysteryId and clueId are required'
				} satisfies ApiError;
			}

			// Get hint by index (first hint if no index provided)
			const hint = store.getHintByIndex(mysteryId, clueId, index);

			if (!hint) {
				set.status = 404;
				return {
					error: 'ClueNotFound',
					message: 'The specified clue could not be found or has no hints available'
				} satisfies ApiError;
			}

			return {
				mysteryId,
				clueId,
				hint
			} satisfies Hint;
		},
		{
			detail: {
				tags: ['Game'],
				summary: 'Get a hint for the current clue',
				description: `Retrieves a hint by index to help solve the current clue. If no index is provided, returns the first hint (index 0). Returns "No more hints." if the index is out of bounds. Hints are unlimited and don't affect scoring.`
			},
			query: t.Object({
				mysteryId: t.String(),
				clueId: t.String(),
				index: t.Optional(t.Numeric())
			})
		}
	)

	// POST /submit - Submit an answer to a clue
	.post(
		'/submit',
		({ body, set }) => {
			const { mysteryId, clueId, answer } = body;

			if (!mysteryId || !clueId || answer === undefined) {
				set.status = 400;
				return {
					error: 'InvalidRequest',
					message: 'mysteryId, clueId, and answer are required'
				} satisfies ApiError;
			}

			// Check if mystery and clue exist
			if (!store.getMysteryById(mysteryId)) {
				set.status = 404;
				return {
					error: 'MysteryNotFound',
					message: 'The specified mystery could not be found'
				} satisfies ApiError;
			}

			if (!store.getClueById(mysteryId, clueId)) {
				set.status = 404;
				return {
					error: 'ClueNotFound',
					message: 'The specified clue could not be found'
				} satisfies ApiError;
			}

			// Check answer
			const isCorrect = store.checkAnswer(mysteryId, clueId, answer);

			if (isCorrect) {
				// Check if this is the last clue
				const isLast = store.isLastClue(mysteryId, clueId);

				if (isLast) {
					// Mystery solved!
					const conclusion = store.getConclusion(mysteryId);
					return {
						correct: true,
						message: "Correct! You've solved the entire mystery!",
						mysteryId,
						clueId,
						mysterySolved: true,
						conclusion: conclusion || 'Congratulations on solving the mystery!'
					} satisfies SubmitResponse;
				} else {
					// Get next clue
					const nextClue = store.getNextClue(mysteryId, clueId);
					return {
						correct: true,
						message: "Correct! Here's your next clue...",
						mysteryId,
						clueId,
						nextClue: nextClue || undefined,
						mysterySolved: false
					} satisfies SubmitResponse;
				}
			} else {
				return {
					correct: false,
					message: 'Not quite right. Try again, or request a hint!',
					mysteryId,
					clueId
				} satisfies SubmitResponse;
			}
		},
		{
			detail: {
				tags: ['Game'],
				summary: 'Submit an answer to a clue',
				description: `Submit your answer to the current clue. If correct, you'll receive the next clue in the chain, or the conclusion if you've solved the mystery.`
			},
			body: t.Object({
				mysteryId: t.String(),
				clueId: t.String(),
				answer: t.String()
			})
		}
	)

	// Root endpoint
	.get('/', () => ({
		message: 'Welcome to RESTlock Holmes!',
		tagline: 'Learn APIs by solving mysteries with code!',

		howToPlay: [
			'1. Get a mystery: GET /mystery',
			'2. Read the clue and use external APIs to find the answer',
			'3. Submit your answer: POST /submit',
			'4. If correct, get the next clue. If stuck, get a hint!',
			'5. Solve all clues to complete the mystery',
			'Check out the documentation for more details (at /openapi)'
		],
		fetchApiTutorial: {
			title: 'Using the Fetch API',
			description: "Here's how to solve mysteries using JavaScript's fetch API",

			steps: [
				{
					description: 'Step 1: Get a mystery to solve',
					code: toCode`// Get a random mystery
const response = await fetch('http://localhost:3000/mystery');
const mystery = await response.json();

console.log(mystery.title);
console.log(mystery.currentClue.text);
// Save mysteryId and clueId - you'll need them!`
				},

				{
					description: 'Step 2: Use external APIs to find the answer',
					code: toCode`// Example: Using PokeAPI to find information
const pokeResponse = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu');
const pokeData = await pokeResponse.json();

// Process the data to find your answer
const answer = pokeData.game_indices.length.toString();
console.log('My answer:', answer);`
				},

				{
					description: 'Step 3: Submit your answer',
					code: toCode`// Submit your answer
const submitResponse = await fetch('http://localhost:3000/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mysteryId: mystery.mysteryId,
    clueId: mystery.currentClue.id,
    answer: answer
  })
});

const result = await submitResponse.json();
console.log(result.message);

if (result.correct && result.nextClue) {
  console.log('Next clue:', result.nextClue.text);
} else if (result.mysterySolved) {
  console.log('Mystery solved!', result.conclusion);
}`
				},
				{
					description: "Optional: Get a hint if you're stuck",
					code: toCode`// Get the first hint (no index parameter)
const hintResponse = await fetch(
  \`http://localhost:3000/hint?mysteryId=\${mystery.mysteryId}&clueId=\${mystery.currentClue.id}\`
);
const hintData = await hintResponse.json();
console.log('Hint:', hintData.hint);

// Get a specific hint by index (e.g., second hint)
const hint2Response = await fetch(
  \`http://localhost:3000/hint?mysteryId=\${mystery.mysteryId}&clueId=\${mystery.currentClue.id}&index=1\`
);
const hint2Data = await hint2Response.json();
console.log('Hint 2:', hint2Data.hint);`
				}
			],

			fullExample: {
				description: 'Complete example: Solving a mystery',
				code: toCode`async function solveMystery() {
  // 1. Get mystery
  const mystery = await fetch('http://localhost:3000/mystery')
    .then(r => r.json());

  console.log('Mystery:', mystery.title);
  console.log('Clue:', mystery.currentClue.text);

  // 2. Use the clue's apiHint to figure out which external API to use
  console.log('API Hint:', mystery.currentClue.apiHint);

  // 3. Query external API (example with Dog API)
  const dogData = await fetch('https://dog.ceo/api/breeds/list/all')
    .then(r => r.json());

  // 4. Process data to find answer
  const answer = dogData.message.hound.length.toString();

  // 5. Submit answer
  const result = await fetch('http://localhost:3000/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mysteryId: mystery.mysteryId,
      clueId: mystery.currentClue.id,
      answer: answer
    })
  }).then(r => r.json());

  console.log(result.message);
  return result;
}

solveMystery();`
			}
		},

		tips: [
			'Read the clue carefully - it tells you exactly what to find',
			'Use the apiHint to know which external API to query',
			'Process the API response to extract the specific data you need',
			'Answers are case-insensitive strings',
			'Each clue has multiple hints - use GET /hint to get hints sequentially',
			'Hints are indexed starting at 0. Omit the index to get the first hint',
			"When you run out of hints, the API will return 'No more hints.'",
			'Check the /openapi docs for full API reference'
		]

		// resources: {
		//   documentation: "See /openapi",
		//   exampleSolutions: "See /tests directory for complete solutions",
		//   mysteryGuide: "See /docs/README.md for creating mysteries",
		// },
	}));
