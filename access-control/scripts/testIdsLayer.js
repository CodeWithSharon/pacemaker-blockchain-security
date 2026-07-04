// scripts/testIdsLayer.js
//
// LAYER 1 + LAYER 2 ISOLATED TEST — no backend, no blockchain, no IPFS.
// Just generates a batch of fake pacemaker signals and checks whether the
// edge IDS (idsEngine.js) correctly flags the bad ones and lets the good ones through.
//
// Run with: node scripts/testIdsLayer.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { analyzeSignal } = require('./idsEngine');

const DOCTOR_ADDRESS = process.env.DEVICE_DOCTOR_ADDRESS;
const ROGUE_ADDRESS = '0xRogueDevice0000000000000000000000000999';

// A fixed, hand-crafted batch of test signals covering every case we expect
// the IDS to handle, so the result is fully predictable and easy to check.
const testSignals = [
  { label: 'Normal signal from doctor device',      signal: { frequency: 72,  sender: DOCTOR_ADDRESS, previousFrequency: 70 }, expected: 'SAFE' },
  { label: 'Normal signal, slightly elevated',       signal: { frequency: 88,  sender: DOCTOR_ADDRESS, previousFrequency: 75 }, expected: 'SAFE' },
  { label: 'Abnormal frequency spike',               signal: { frequency: 120, sender: DOCTOR_ADDRESS, previousFrequency: 75 }, expected: 'FLAGGED: Abnormal Frequency Spike' },
  { label: 'Borderline frequency (exactly 90)',      signal: { frequency: 90,  sender: DOCTOR_ADDRESS, previousFrequency: 75 }, expected: 'SAFE' },
  { label: 'Just over the threshold (91)',           signal: { frequency: 91,  sender: DOCTOR_ADDRESS, previousFrequency: 75 }, expected: 'FLAGGED: Abnormal Frequency Spike' },
  { label: 'Unauthorized/rogue sender',              signal: { frequency: 75,  sender: ROGUE_ADDRESS,  previousFrequency: 75 }, expected: 'FLAGGED: Unauthorized Command Injection' },
  { label: 'Rogue sender AND abnormal frequency',    signal: { frequency: 130, sender: ROGUE_ADDRESS,  previousFrequency: 75 }, expected: 'FLAGGED: Abnormal Frequency Spike (checked first)' },
];

console.log('🧪 LAYER 1+2 ISOLATED TEST: Edge IDS signal analysis\n');
console.log(`   Authorized doctor address: ${DOCTOR_ADDRESS}`);
console.log(`   Rogue test address:        ${ROGUE_ADDRESS}\n`);

let passCount = 0;

testSignals.forEach((test, i) => {
  const result = analyzeSignal(test.signal);
  const actual = result ? `FLAGGED: ${result.type}` : 'SAFE';

  // Loose match so the "checked first" note in expected doesn't break comparison
  const matches = test.expected.startsWith(actual) || actual === 'SAFE' && test.expected === 'SAFE'
    ? actual.startsWith('FLAGGED') ? test.expected.includes(actual.replace('FLAGGED: ', '')) : actual === test.expected
    : false;

  const passed = test.expected.includes(actual) || actual === test.expected;

  console.log(`${i + 1}. ${test.label}`);
  console.log(`   Input:    freq=${test.signal.frequency}, sender=${test.signal.sender.slice(0, 16)}...`);
  console.log(`   Expected: ${test.expected}`);
  console.log(`   Actual:   ${actual}`);
  console.log(`   Result:   ${passed ? '✅ PASS' : '❌ FAIL'}\n`);

  if (passed) passCount++;
});

console.log(`\n${'='.repeat(50)}`);
console.log(`SUMMARY: ${passCount}/${testSignals.length} tests passed`);
console.log('='.repeat(50));

if (passCount === testSignals.length) {
  console.log('\n✅ Edge IDS layer is working correctly in isolation.');
} else {
  console.log('\n❌ Some cases did not behave as expected — review idsEngine.js logic.');
}