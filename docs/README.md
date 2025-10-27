# How to write a Mystery/Scavenger Hunt

This guide will help you create engaging API-based mysteries for the Mystery Hunt app.

## How Mysteries Work

Each mystery is a **chain of clues** where:
1. Players start with the first clue
2. They must solve it correctly to get the next clue
3. Each clue has its own answer and hints
4. When they solve the final clue, they see the conclusion

This creates a progressive mystery hunt experience!

## Adding to the list

To add a new mystery to the game, edit the `mysteries.yaml` file in the root directory. Each mystery follows this structure:

```yaml
- id: myst_XXX              # Unique identifier (use next number in sequence)
  title: "Mystery Title"    # Catchy, engaging title
  difficulty: easy          # easy, medium, or hard
  scenario: "Story text"    # The narrative/context for the mystery
  clues:                    # Array of clues - each leads to the next!
    - id: clue_001
      text: "First clue text"
      apiHint: "Which API to use with a link to docs"
      answer: "answer_to_clue_1"  # Answer unlocks next clue
      hints:                # Hints specific to THIS clue (unlimited)
        - "First hint (vague)"
        - "Second hint (more specific)"
        - "Third hint (very specific)"
    - id: clue_002
      text: "Second clue text (only shown after solving clue 1)"
      apiHint: "API hint for second clue"
      answer: "answer_to_clue_2"
      hints:
        - "Hint for clue 2"
        - "More specific hint for clue 2"
    - id: clue_003
      text: "Final clue text"
      apiHint: "API hint for final clue"
      answer: "final_answer"       # Solving this shows conclusion
      hints:
        - "Final clue hint"
        - "Very specific guidance"
  conclusion: "The ending story/message when all clues are solved"
```

### Example Mystery

```yaml
- id: myst_004
  title: "The API Detective"
  difficulty: medium
  scenario: "A mysterious developer left clues in JSONPlaceholder. Follow the breadcrumbs..."
  clues:
    - id: clue_001
      text: "Find post #42 and tell me the userId. Who posted it?"
      apiHint: "Use JSONPlaceholder API (https://jsonplaceholder.typicode.com/)"
      answer: "5"
      hints:
        - "Use the /posts endpoint with post ID"
        - "Try: https://jsonplaceholder.typicode.com/posts/42"
        - "Look for the 'userId' field in the JSON response"
    - id: clue_002
      text: "Great! Now find user #5's email domain (the part after @). What is it?"
      apiHint: "Use the /users endpoint to get user details"
      answer: "biz"
      hints:
        - "Fetch user details: /users/5"
        - "Look at the 'email' field"
        - "Extract everything after the @ symbol"
    - id: clue_003
      text: "Perfect! Now count how many todos user #5 has completed. What's the number?"
      apiHint: "Use the /todos endpoint with userId parameter"
      answer: "12"
      hints:
        - "Use: /todos?userId=5&completed=true"
        - "Count the number of items in the returned array"
        - "The answer is the array length"
  conclusion: "Excellent work, detective! You've traced the developer's digital footprints through JSONPlaceholder. User #5 was indeed the key to unlocking this mystery!"
```

## Writing good mysteries

### Key Principles

1. **Use Free, Public APIs** - No authentication required
   - Students shouldn't need API keys or accounts
   - Focus on educational/fun APIs: PokéAPI, Open Notify, JSONPlaceholder, etc.

2. **Clear Instructions** - Make the task unambiguous
   - Specify exactly what to find (e.g., "count the number of X")
   - State the expected format (e.g., "round to nearest integer")

3. **Progressive Hints per Clue** - Start vague, get specific
   - Hint 1: Which API endpoint to use
   - Hint 2: What parameters/fields to look for
   - Hint 3: Exact steps to calculate the answer
   - Each clue should have 3-5 hints

4. **Appropriate Difficulty**
   - **Easy**: Single API call, simple extraction (2-3 clues)
   - **Medium**: Multiple API calls or data processing (3-4 clues)
   - **Hard**: Complex filtering, calculations, or nested data (4-5 clues)

### Mystery Ideas

Create **clue chains** like:

**The Pokémon Trail:**
1. "Find a water-type Pokémon that starts with 'S' and has 8 letters" → squirtle
2. "Get Squirtle's Pokédex number" → 7
3. "Multiply that number by Squirtle's base speed stat" → final answer

**The Country Code Quest:**
1. "Find the country with calling code +33" → France
2. "Get France's capital city" → Paris
3. "Count the letters in that city name" → 5

**The GitHub Journey:**
1. "Find how many followers the user 'torvalds' has" → dynamic
2. "Is that number greater than 100000? (yes/no)" → yes
3. "Count his public repositories" → dynamic

Each clue should build on the previous answer or lead the player deeper into the API!

### API Resources

See [API_LIST](./API_LIST.md)

### Answer Types

**Static Answers** - Use exact strings:
All answers should be exact strings (case-insensitive):
```yaml
answer: "219"        # Numeric answer as string
answer: "boldore"    # Text answer
answer: "7"          # Single digit
```

The app performs case-insensitive matching, so "Boldore", "boldore", and "BOLDORE" are all accepted.

### Testing Your Mystery

Before adding a mystery:
1. Test each API endpoint yourself
2. Verify each answer is obtainable
3. Ensure API documentation is accessible
4. Check that hints for each clue lead to the solution
5. Test the entire clue chain from start to finish

Students can compete to see who solves all challenges fastest using JavaScript fetch requests!
