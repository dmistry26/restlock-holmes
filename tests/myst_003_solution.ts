/**
 * Test/Example Solution for Mystery 003: The JSONPlaceholder Puzzle
 */

const BASE_URL = 'http://localhost:3000';
const JSON_API_BASE = 'https://jsonplaceholder.typicode.com';

async function solveMystery003() {
  console.log('🔍 Starting Mystery 003: The JSONPlaceholder Puzzle\n');

  const mysteryRes = await fetch(`${BASE_URL}/mystery?difficulty=easy`);
  const mystery = await mysteryRes.json();

  // Filter to get the JSONPlaceholder Mystery (myst_003)
  if (mystery.mysteryId !== 'myst_003') {
    console.log(`⏭️  Skipping ${mystery.mysteryId}, looking for myst_003...`);
    return [];
  }

  console.log(`📖 Mystery: ${mystery.title}`);
  console.log(`📝 Scenario: ${mystery.scenario}\n`);

  const results: any[] = [];

  // === CLUE 1 ===
  console.log('--- Clue 1 ---');
  console.log(mystery.currentClue.text);

  const postRes = await fetch(`${JSON_API_BASE}/posts/50`);
  const postData = await postRes.json();

  const answer1 = postData.userId.toString();
  console.log(`💡 Answer: ${answer1} (userId from post #50)`);

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
  results.push({ clueId: mystery.currentClue.id, answer: answer1, correct: submitData.correct });

  if (!submitData.correct || !submitData.nextClue) {
    console.error('❌ Failed to solve clue 1');
    return results;
  }

  // === CLUE 2 ===
  const clue2 = submitData.nextClue;
  console.log('--- Clue 2 ---');
  console.log(clue2.text);

  const userRes = await fetch(`${JSON_API_BASE}/users/5`);
  const userData = await userRes.json();

  const fullName = userData.name;
  const firstName = fullName.split(' ')[0];
  const answer2 = firstName;
  console.log(`💡 Answer: ${answer2} (first name from "${fullName}")`);

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
  results.push({ clueId: clue2.id, answer: answer2, correct: submitData.correct });

  if (!submitData.correct || !submitData.nextClue) {
    console.error('❌ Failed to solve clue 2');
    return results;
  }

  // === CLUE 3 ===
  const clue3 = submitData.nextClue;
  console.log('--- Clue 3 ---');
  console.log(clue3.text);

  const answer3 = answer2.length.toString();
  console.log(`💡 Answer: ${answer3} (length of "${answer2}")`);

  submitRes = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mysteryId: mystery.mysteryId,
      clueId: clue3.id,
      answer: answer3
    })
  });

  submitData = await submitRes.json();
  console.log(`✅ ${submitData.message}`);

  if (submitData.mysterySolved) {
    console.log(`\n🎉 ${submitData.conclusion}\n`);
  }

  results.push({ clueId: clue3.id, answer: answer3, correct: submitData.correct });

  return results;
}

if (require.main === module) {
  solveMystery003()
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

export { solveMystery003 };
