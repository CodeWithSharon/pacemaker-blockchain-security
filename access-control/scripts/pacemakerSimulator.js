// scripts/pacemakerSimulator.js
//
// Connects the already-proven pieces into one live flow:
//
//   1. Generate a random signal (Layer 1 — proven in testLiveSimulator.js)
//   2. Run it through the edge IDS (Layer 2 — idsEngine.js, proven in testIdsLayer.js)
//   3a. If FLAGGED  -> POST /api/ids-alerts  (blockchain + IPFS, already proven via curl)
//   3b. If SAFE     -> POST /api/access-logs (blockchain, already proven via curl)
//
// Nothing new here logic-wise — this script just calls the two endpoints we've
// already individually verified, based on the edge IDS result.
//
// Run with: node scripts/pacemakerSimulator.js
// Requires: Hardhat node running, contracts deployed, Backend running.
// Press Ctrl+C to stop.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { analyzeSignal } = require('./idsEngine');

const BACKEND_URL = 'http://localhost:5000';
const CYCLE_DELAY_MS = 4000; // one simulated signal every 4 seconds

const DOCTOR_ADDRESS = process.env.DEVICE_DOCTOR_ADDRESS;
const ROGUE_ADDRESS = '0xRogueDevice0000000000000000000000000999';

let previousFrequency = 72;
let cycle = 0;

const stats = { total: 0, safe: 0, flagged: 0, errors: 0 };

function generateRandomSignal() {
  const isSpike = Math.random() < 0.15;
  const frequency = isSpike
    ? Math.floor(95 + Math.random() * 40)
    : Math.floor(60 + Math.random() * 25);

  const isRogue = Math.random() < 0.15;
  const sender = isRogue ? ROGUE_ADDRESS : DOCTOR_ADDRESS;

  const signal = { frequency, sender, previousFrequency };
  previousFrequency = frequency;
  return signal;
}

async function logAlert(payload) {
  const res = await fetch(`${BACKEND_URL}/api/ids-alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function logAccess(purpose) {
  const res = await fetch(`${BACKEND_URL}/api/access-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purpose }),
  });
  return res.json();
}

async function runCycle() {
  cycle += 1;
  stats.total += 1;

  const signal = generateRandomSignal();
  const senderLabel = signal.sender === DOCTOR_ADDRESS ? 'doctor (authorized)' : 'ROGUE (unauthorized)';
  console.log(`\nCycle ${cycle}: freq=${signal.frequency}, sender=${senderLabel}`);

  const result = analyzeSignal(signal);

  try {
    if (result) {
      // Edge IDS flagged this signal -> log as an IDS alert (blockchain + IPFS)
      console.log(`   🛑 Edge IDS FLAGGED: ${result.type}`);
      const response = await logAlert({
        patientId: 'P-SIM-01',
        attackType: result.type,
        alteredFrequency: String(result.alteredFrequency),
        previousFrequency: String(result.previousFrequency),
        source: result.source,
        severity: result.severity,
        deviceModel: 'PM-Simulated-X1',
        riskCategory: 'Device Layer',
      });

      if (response.success) {
        console.log(`   ✅ Alert logged on-chain (block ${response.blockNumber}, IPFS: ${response.ipfsHash})`);
        stats.flagged += 1;
      } else {
        console.log(`   ⚠️  Failed to log alert:`, response.error);
        stats.errors += 1;
      }
    } else {
      // Signal is safe -> log as a normal access/telemetry entry
      console.log(`   ✅ Edge IDS: signal looks normal`);
      const response = await logAccess('Routine telemetry signal');

      if (response.success) {
        console.log(`   ✅ Access logged on-chain (block ${response.blockNumber})`);
        stats.safe += 1;
      } else {
        console.log(`   ⚠️  Failed to log access:`, response.error);
        stats.errors += 1;
      }
    }
  } catch (err) {
    console.log(`   ⚠️  Could not reach backend:`, err.message);
    stats.errors += 1;
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('PACEMAKER SIMULATOR SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total signals generated: ${stats.total}`);
  console.log(`Logged as safe access:    ${stats.safe}`);
  console.log(`Logged as IDS alerts:     ${stats.flagged}`);
  console.log(`Errors (backend issues):  ${stats.errors}`);
  console.log('='.repeat(50));
}

console.log('🫀 Pacemaker Simulator — LIVE, connected to real backend/blockchain');
console.log(`   Backend: ${BACKEND_URL}`);
console.log(`   Generating a signal every ${CYCLE_DELAY_MS / 1000}s.`);
console.log('   Watch your IDS Alerts page (polls every 10s) — alerts should appear automatically.');
console.log('   Press Ctrl+C to stop and see the summary.\n');

const interval = setInterval(runCycle, CYCLE_DELAY_MS);

process.on('SIGINT', () => {
  clearInterval(interval);
  printSummary();
  process.exit(0);
});