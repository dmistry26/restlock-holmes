import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { store } from "./store";
import { Mystery, Hint, SubmitRequest, SubmitResponse, ApiError } from "./types";

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

        // Create a new mystery
        const state = store.createMystery(
          difficulty as "easy" | "medium" | "hard" | undefined
        );

        // Return the mystery (without answer and hints)
        return state.mystery satisfies Mystery;
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

  // GET /hint - Get a hint for the current mystery
  .get(
    "/hint",
    ({ query, set }) => {
      const { mysteryId, hintLevel = 1 } = query;

      if (!mysteryId) {
        set.status = 400;
        return {
          error: "MissingParameter",
          message: "mysteryId is required",
        } satisfies ApiError;
      }

      // Validate hint level
      if (hintLevel < 1 || hintLevel > 3) {
        set.status = 400;
        return {
          error: "InvalidHintLevel",
          message: "Hint level must be between 1 and 3",
        } satisfies ApiError;
      }

      // Get the mystery state
      const state = store.getMystery(mysteryId);
      if (!state) {
        set.status = 404;
        return {
          error: "MysteryNotFound",
          message: "The specified mystery could not be found",
        } satisfies ApiError;
      }

      // Check if hints are available
      const hintsRemaining = state.hints.length - state.hintsUsed;
      if (hintsRemaining === 0) {
        set.status = 403;
        return {
          error: "NoHintsRemaining",
          message: "No hints remaining for this mystery",
        } satisfies ApiError;
      }

      // Check if the requested hint level is available
      if (hintLevel > state.hintsUsed + 1) {
        set.status = 400;
        return {
          error: "InvalidHintLevel",
          message: `You must request hints in order. Next available hint is level ${
            state.hintsUsed + 1
          }`,
        } satisfies ApiError;
      }

      // Use a hint if requesting a new one
      if (hintLevel === state.hintsUsed + 1) {
        store.useHint(mysteryId);
      }

      // Return the hint
      const hintText = state.hints[hintLevel - 1];
      return {
        mysteryId,
        hintLevel,
        hint: hintText,
        hintsRemaining: state.hints.length - state.hintsUsed,
      } satisfies Hint;
    },
    {
      detail: {
        tags: ["Game"],
        summary: "Get a hint for the current mystery",
        description: `Retrieves a hint to help solve the current mystery. Each mystery has a
limited number of hints available.`,
      },
      query: t.Object({
        mysteryId: t.String(),
        hintLevel: t.Optional(t.Number({ minimum: 1, maximum: 3 })),
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

      // Get the mystery state
      const state = store.getMystery(mysteryId);
      if (!state) {
        set.status = 404;
        return {
          error: "MysteryNotFound",
          message: "The specified mystery could not be found",
        } satisfies ApiError;
      }

      // Check if already solved
      if (state.solved) {
        set.status = 400;
        return {
          error: "AlreadySolved",
          message: "This mystery has already been solved",
        } satisfies ApiError;
      }

      // Check if max attempts reached
      if (state.attempts >= state.maxAttempts) {
        set.status = 429;
        return {
          error: "TooManyAttempts",
          message: "Maximum number of attempts exceeded for this mystery",
        } satisfies ApiError;
      }

      // Submit the answer
      const result = store.submitAnswer(mysteryId, answer);

      if (result.correct) {
        // Correct answer
        const timeToSolve = store.getTimeToSolve(
          result.state.startedAt,
          result.state.solvedAt!
        );

        return {
          correct: true,
          message: "Congratulations! You've solved the mystery!",
          mysteryId,
          solvedAt: result.state.solvedAt,
          nextMysteryAvailable: true,
          stats: {
            timeToSolve,
            hintsUsed: result.state.hintsUsed,
            attemptsUsed: result.state.attempts,
          },
        } satisfies SubmitResponse;
      } else {
        // Incorrect answer
        const attemptsRemaining = state.maxAttempts - state.attempts;

        let message = "Not quite right. ";
        if (attemptsRemaining > 0) {
          message += `You have ${attemptsRemaining} attempt${
            attemptsRemaining === 1 ? "" : "s"
          } remaining.`;
        } else {
          message += "No attempts remaining.";
        }

        // Add a helpful hint based on the mystery
        if (state.mystery.mysteryId === "myst_001") {
          message += " Remember to sum ALL game_indices values.";
        }

        return {
          correct: false,
          message,
          mysteryId,
          attemptsRemaining,
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
      hint: "GET /hint?mysteryId={id}&hintLevel={1-3}",
      submit: "POST /submit {mysteryId, answer}",
      docs: "/swagger",
    },
    instructions:
      "Start by getting a mystery, then use external APIs to solve it!",
  }))

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(`📚 API Documentation: http://${app.server?.hostname}:${app.server?.port}/swagger`);
