/**
 * Test/Example Solution for Mystery 001: The Evolved Enigma
 *
 * This file demonstrates how to solve each clue in the mystery.
 * It can also be used as an automated test.
 */

const BASE_URL = 'http://localhost:3000';
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

interface TestResult {
  clueId: string;
  answer: string;
  correct: boolean;
  message: string;
}

async function solveMystery001() {
  console.log('🔍 Starting Mystery 001: The Evolved Enigma\n');

  // Get the mystery
  const mysteryRes = await fetch(`${BASE_URL}/mystery`);
  const mystery = await mysteryRes.json();
  console.log(`📖 Mystery: ${mystery.title}`);
  console.log(`📝 Scenario: ${mystery.scenario}\n`);

  const results: TestResult[] = [];

  // === CLUE 1 ===
  console.log('--- Clue 1 ---');
  console.log(mystery.currentClue.text);

  // Fetch rock-type Pokemon
  const rockTypeRes = await fetch(`${POKEAPI_BASE}/type/rock`);
  const rockTypeData = await rockTypeRes.json();

  // Find Pokemon ending in 'dore' with 7 letters
  const rockPokemon = rockTypeData.pokemon.map((p: any) => p.pokemon.name);
  const dorePokemons = rockPokemon.filter((name: string) =>
    name.endsWith('dore') && name.length === 7
  );

  const answer1 = dorePokemons[0]; // "boldore"
  console.log(`💡 Answer: ${answer1}`);

  // Submit answer
  let submitRes = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mysteryId: mystery.mysteryId,
      clueId: mystery.currentClue.id,
      answer: answer1
    })
  });

  let submitData = await submitRes.json();
  console.log(`✅ ${submitData.message}\n`);
  results.push({
    clueId: mystery.currentClue.id,
    answer: answer1,
    correct: submitData.correct,
    message: submitData.message
  });

  if (!submitData.correct || !submitData.nextClue) {
    console.error('❌ Failed to solve clue 1');
    return results;
  }

  // === CLUE 2 ===
  const clue2 = submitData.nextClue;
  console.log('--- Clue 2 ---');
  console.log(clue2.text);

  // Get Boldore details
  const boldoreRes = await fetch(`${POKEAPI_BASE}/pokemon/boldore`);
  const boldoreData = await boldoreRes.json();

  // Count game_indices
  const gameIndicesCount = boldoreData.game_indices.length;
  const answer2 = gameIndicesCount.toString();
  console.log(`💡 Answer: ${answer2}`);

  submitRes = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mysteryId: mystery.mysteryId,
      clueId: clue2.id,
      answer: answer2
    })
  });

  submitData = await submitRes.json();
  console.log(`✅ ${submitData.message}\n`);
  results.push({
    clueId: clue2.id,
    answer: answer2,
    correct: submitData.correct,
    message: submitData.message
  });

  if (!submitData.correct || !submitData.nextClue) {
    console.error('❌ Failed to solve clue 2');
    return results;
  }

  // === CLUE 3 ===
  const clue3 = submitData.nextClue;
  console.log('--- Clue 3 ---');
  console.log(clue3.text);

  // Find HP stat
  const hpStat = boldoreData.stats.find((s: any) => s.stat.name === 'hp');
  const hpValue = hpStat.base_stat;

  // Multiply game indices count by HP
  const finalAnswer = (gameIndicesCount * hpValue).toString();
  console.log(`💡 Answer: ${finalAnswer} (${gameIndicesCount} × ${hpValue})`);

  submitRes = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mysteryId: mystery.mysteryId,
      clueId: clue3.id,
      answer: finalAnswer
    })
  });

  submitData = await submitRes.json();
  console.log(`✅ ${submitData.message}`);

  if (submitData.mysterySolved) {
    console.log(`\n🎉 ${submitData.conclusion}\n`);
  }

  results.push({
    clueId: clue3.id,
    answer: finalAnswer,
    correct: submitData.correct,
    message: submitData.message
  });

  return results;
}

// Run the test
if (require.main === module) {
  solveMystery001()
    .then(results => {
      console.log('\n📊 Results:');
      results.forEach(r => {
        console.log(`  ${r.correct ? '✅' : '❌'} ${r.clueId}: ${r.answer}`);
      });

      const allCorrect = results.every(r => r.correct);
      process.exit(allCorrect ? 0 : 1);
    })
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

export { solveMystery001 };
