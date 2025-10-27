/**
 * Test Runner - Runs all mystery solution tests
 */

import { solveMystery001 } from './myst_001_solution';
import { solveMystery002 } from './myst_002_solution';
import { solveMystery003 } from './myst_003_solution';

async function runAllTests() {
  console.log('🧪 Running all mystery tests...\n');
  console.log('=' .repeat(60));

  const allResults: any[] = [];
  let testsPassed = 0;
  let testsFailed = 0;

  // Test Mystery 001
  try {
    console.log('\n');
    const results001 = await solveMystery001();
    allResults.push({ mystery: 'myst_001', results: results001 });
    if (results001.every(r => r.correct)) {
      testsPassed++;
    } else {
      testsFailed++;
    }
  } catch (err) {
    console.error('❌ Mystery 001 failed:', err);
    testsFailed++;
  }

  console.log('\n' + '='.repeat(60));

  // Test Mystery 002
  try {
    console.log('\n');
    const results002 = await solveMystery002();
    if (results002.length > 0) {
      allResults.push({ mystery: 'myst_002', results: results002 });
      if (results002.every(r => r.correct)) {
        testsPassed++;
      } else {
        testsFailed++;
      }
    }
  } catch (err) {
    console.error('❌ Mystery 002 failed:', err);
    testsFailed++;
  }

  console.log('\n' + '='.repeat(60));

  // Test Mystery 003
  try {
    console.log('\n');
    const results003 = await solveMystery003();
    if (results003.length > 0) {
      allResults.push({ mystery: 'myst_003', results: results003 });
      if (results003.every(r => r.correct)) {
        testsPassed++;
      } else {
        testsFailed++;
      }
    }
  } catch (err) {
    console.error('❌ Mystery 003 failed:', err);
    testsFailed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 FINAL RESULTS\n');

  allResults.forEach(({ mystery, results }) => {
    const allCorrect = results.every((r: any) => r.correct);
    console.log(`${allCorrect ? '✅' : '❌'} ${mystery}: ${results.length} clues`);
    results.forEach((r: any) => {
      console.log(`   ${r.correct ? '✅' : '❌'} ${r.clueId}: ${r.answer}`);
    });
  });

  console.log(`\n${testsPassed} passed, ${testsFailed} failed\n`);

  process.exit(testsFailed === 0 ? 0 : 1);
}

runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
