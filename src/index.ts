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

  // GET /hint - Get a random hint for a mystery
  .get(
    "/hint",
    ({ query, set }) => {
      const { mysteryId } = query;

      if (!mysteryId) {
        set.status = 400;
        return {
          error: "MissingParameter",
          message: "mysteryId is required",
        } satisfies ApiError;
      }

      // Get a random hint (stateless)
      const hint = store.getRandomHint(mysteryId);

      if (!hint) {
        set.status = 404;
        return {
          error: "MysteryNotFound",
          message: "The specified mystery could not be found",
        } satisfies ApiError;
      }

      return {
        mysteryId,
        hint,
      } satisfies Hint;
    },
    {
      detail: {
        tags: ["Game"],
        summary: "Get a hint for the current mystery",
        description: `Retrieves a random hint to help solve the mystery. Hints are unlimited and don't affect scoring.`,
      },
      query: t.Object({
        mysteryId: t.String(),
      }),
    }
  )

  // POST /submit - Submit an answer to a mystery
  .post(
    "/submit",
    ({ body, set }) => {
      const { mysteryId, answer } = body;

      if (!mysteryId || answer === undefined) {
        set.status = 400;
        return {
          error: "InvalidRequest",
          message: "mysteryId and answer are required",
        } satisfies ApiError;
      }

      // Check answer (stateless)
      const isCorrect = store.checkAnswer(mysteryId, answer);

      if (!store.getMysteryById(mysteryId)) {
        set.status = 404;
        return {
          error: "MysteryNotFound",
          message: "The specified mystery could not be found",
        } satisfies ApiError;
      }

      if (isCorrect) {
        return {
          correct: true,
          message: "Congratulations! You've solved the mystery!",
          mysteryId,
          solvedAt: new Date().toISOString(),
          nextMysteryAvailable: true,
        } satisfies SubmitResponse;
      } else {
        return {
          correct: false,
          message: "Not quite right. Try again, or request a hint!",
          mysteryId,
        } satisfies SubmitResponse;
      }
    },
    {
      detail: {
        tags: ["Game"],
        summary: "Submit an answer to a mystery",
        description: `Submit your calculated answer to verify if you've solved the mystery correctly.
The answer should be derived from processing external API data programmatically.`,
      },
      body: t.Object({
        mysteryId: t.String(),
        answer: t.String(),
      }),
    }
  )

  // Root endpoint
  .get("/", () => ({
    message: "Welcome to API Mystery Hunt!",
    endpoints: {
      mystery: "GET /mystery?difficulty=easy|medium|hard",
      hint: "GET /hint?mysteryId={id}",
      submit: "POST /submit {mysteryId, answer}",
      docs: "/swagger",
    },
    instructions:
      "Start by getting a mystery, then use external APIs to solve it! Hints are unlimited.",
  }))

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(`📚 API Documentation: http://${app.server?.hostname}:${app.server?.port}/swagger`);
