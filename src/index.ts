import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { store } from "./store";
import { Mystery, Hint, ApiError, SubmitResponse } from "./types";

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "API Mystery Hunt",
          version: "1.0.0",
          description: `An educational escape room API that teaches developers how to read documentation
and work with APIs through puzzle-solving. Solve mysteries by reading docs,
making API calls, and processing data programmatically.`,
        },
        tags: [
          {
            name: "Game",
            description: "Core game mechanics for mystery solving",
          },
        ],
      },
    })
  )

  // GET /mystery - Get a new mystery to solve
  .get(
    "/mystery",
    ({ query, set }) => {
      try {
        const { difficulty } = query;

        // Validate difficulty if provided
        if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) {
          set.status = 400;
          return {
            error: "InvalidDifficulty",
            message: "Difficulty must be 'easy', 'medium', or 'hard'",
          } satisfies ApiError;
        }

        // Get a random mystery (stateless)
        const mystery = store.getRandomMystery(
          difficulty as "easy" | "medium" | "hard" | undefined
        );

        return mystery satisfies Mystery;
      } catch (error) {
        set.status = 500;
        return {
          error: "InternalServerError",
          message: "Failed to create mystery",
        } satisfies ApiError;
      }
    },
    {
      detail: {
        tags: ["Game"],
        summary: "Get a new mystery to solve",
        description: `Retrieves a new mystery case with clues that point to external APIs.
Each mystery requires reading API documentation and writing code to solve.`,
      },
      query: t.Object({
        difficulty: t.Optional(
          t.Union([t.Literal("easy"), t.Literal("medium"), t.Literal("hard")])
        ),
      }),
    }
  )

  // GET /hint - Get a random hint for a specific clue
  .get(
    "/hint",
    ({ query, set }) => {
      const { mysteryId, clueId } = query;

      if (!mysteryId || !clueId) {
        set.status = 400;
        return {
          error: "MissingParameter",
          message: "mysteryId and clueId are required",
        } satisfies ApiError;
      }

      // Get a random hint for this clue (stateless)
      const hint = store.getRandomHint(mysteryId, clueId);

      if (!hint) {
        set.status = 404;
        return {
          error: "ClueNotFound",
          message: "The specified clue could not be found or has no hints available",
        } satisfies ApiError;
      }

      return {
        mysteryId,
        clueId,
        hint,
      } satisfies Hint;
    },
    {
      detail: {
        tags: ["Game"],
        summary: "Get a hint for the current clue",
        description: `Retrieves a random hint to help solve the current clue. Hints are unlimited and don't affect scoring.`,
      },
      query: t.Object({
        mysteryId: t.String(),
        clueId: t.String(),
      }),
    }
  )

  // POST /submit - Submit an answer to a clue
  .post(
    "/submit",
    ({ body, set }) => {
      const { mysteryId, clueId, answer } = body;

      if (!mysteryId || !clueId || answer === undefined) {
        set.status = 400;
        return {
          error: "InvalidRequest",
          message: "mysteryId, clueId, and answer are required",
        } satisfies ApiError;
      }

      // Check if mystery and clue exist
      if (!store.getMysteryById(mysteryId)) {
        set.status = 404;
        return {
          error: "MysteryNotFound",
          message: "The specified mystery could not be found",
        } satisfies ApiError;
      }

      if (!store.getClueById(mysteryId, clueId)) {
        set.status = 404;
        return {
          error: "ClueNotFound",
          message: "The specified clue could not be found",
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
            conclusion: conclusion || "Congratulations on solving the mystery!",
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
            mysterySolved: false,
          } satisfies SubmitResponse;
        }
      } else {
        return {
          correct: false,
          message: "Not quite right. Try again, or request a hint!",
          mysteryId,
          clueId,
        } satisfies SubmitResponse;
      }
    },
    {
      detail: {
        tags: ["Game"],
        summary: "Submit an answer to a clue",
        description: `Submit your answer to the current clue. If correct, you'll receive the next clue in the chain, or the conclusion if you've solved the mystery.`,
      },
      body: t.Object({
        mysteryId: t.String(),
        clueId: t.String(),
        answer: t.String(),
      }),
    }
  )

  // Root endpoint
  .get("/", () => ({
    message: "Welcome to API Mystery Hunt!",
    endpoints: {
      mystery: "GET /mystery?difficulty=easy|medium|hard",
      hint: "GET /hint?mysteryId={id}&clueId={clueId}",
      submit: "POST /submit {mysteryId, clueId, answer}",
      docs: "/swagger",
    },
    instructions:
      "Start by getting a mystery, solve each clue to get the next one, and use external APIs! Each clue has unlimited hints.",
  }))

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(`📚 API Documentation: http://${app.server?.hostname}:${app.server?.port}/swagger`);
