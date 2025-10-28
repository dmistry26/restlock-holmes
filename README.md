# RESTlock Holmes 🔍

An educational escape room experience that teaches developers how to read documentation and work with APIs through puzzle-solving.

## Overview

API Mystery Hunt is an interactive learning platform built with [Elysia](https://elysiajs.com/) that challenges students to solve mysteries by reading API documentation and writing code to extract information from various APIs. Unlike traditional tutorials, this project emphasizes real-world skills: understanding documentation, making API calls, and processing data programmatically.

## The Concept

Students are presented with mystery scenarios where clues point them toward specific APIs (both internal and external). To solve each clue, they must:

1. **Read the documentation** of the API hinted by the clue to understand which endpoint to use
2. **Write code** to query the API with the right parameters
3. **Process the data** programmatically to find the answer

The clues are designed so that answers **cannot** be simply Googled or manually searched: they require programmatic solutions.

## Example Challenge

**Clue:** "Find the second evolution of a rock-type Pokémon whose name ends in 'dore'. Your answer is the sum of all game_indices for this Pokémon."

**Solution approach:**
- Read [PokéAPI documentation](https://pokeapi.co/docs/v2)
- Use filtering to find rock-type Pokémon
- Identify the correct evolution chain
- Fetch the Pokémon's data
- Write code to sum the `game_indices` values

This can't be Googled because it requires:
- Requires API-specific data processing
- Multiple API calls or complex filtering
- Programmatic calculation

## How It Works

### Internal APIs (Built with Elysia)

Our platform provides several endpoints:

- **Get Mystery Jobs**: Fetch new mystery scenarios to solve
- **Get Clues**: Retrieve clues for active mysteries
- **Verify Answers**: Submit solutions to check if they're correct

These endpoints are documented using OpenAPI specifications, teaching students to work with API documentation from the start.

### External APIs

Clues direct students to various public APIs such as:
- [PokéAPI](https://pokeapi.co/) - Pokémon data
- [REST Countries](https://restcountries.com/) - Country information
- [Open Library](https://openlibrary.org/developers/api) - Book data
- And more...

## Learning Objectives

Students will learn to:

- 📖 **Read and interpret API documentation** (including OpenAPI specs)
- 🔌 **Make HTTP requests** to various APIs
- 🔍 **Use query parameters and filters** effectively
- 💻 **Write code to process API responses**
- 🧩 **Solve problems programmatically** rather than manually
- 🔗 **Work with multiple APIs** in a single solution

## Clue Design Principles

Effective clues should only be feasible when the player uses the API as intended. Here are some ideas for how this can be achieved:

1. Require large search spaces (forcing filtering or programmatic searching)
2. Need API-specific IDs
3. Require chaining multiple API calls for a large search space (too tedious to do by hand)
4. Involve data transformation (answers require calculations or aggregations)

## Tech Stack

- **[Elysia](https://elysiajs.com/)** - Fast and ergonomic web framework for Bun
- **OpenAPI** - Auto-generated API documentation for clues, mysteries, and verification, to simulate actual documentation.
- **Bun** - JavaScript runtime

## Getting Started

```bash
# Install dependencies
bun install

# Start the development server
bun run dev

# The API will be available at http://localhost:3000
```

## API Documentation

Once running, visit `http://localhost:3000/swagger` to view the interactive API documentation.

## Contributing

Ideas for new mysteries and clues are welcome! When designing puzzles, ensure they:
- Cannot be solved by simple Google searches
- Require reading specific API documentation
- Need programmatic solutions (not manual data browsing)
- Teach valuable real-world skills

## Philosophy

The best way to learn APIs isn't through tutorials—it's through **necessity**. By creating engaging mysteries that can only be solved through proper API usage, students develop the critical skill of reading documentation and applying it to real problems.

---

*"The mystery is not in the answer, but in knowing which question to ask the API."*
