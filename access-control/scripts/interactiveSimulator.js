// scripts/interactiveSimulator.js
// Interactive pacemaker signal simulator — YOU choose what signal to send.
// Each choice triggers the full pipeline: Edge IDS → Backend → Blockchain → IPFS → MySQL
// Watch your IDS Alerts page auto-refresh to see results live.

require("dotenv").config({ path: "../.env" });
const readline = require("readline");
const axios    = require("axios");
const { analyzeSignal } = require("./idsEngine");

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

// Simulated devices
const DEVICES = {
  doctor:     { address: process.env.DEVICE_DOCTOR_ADDRESS,    name: "Dr. Smith (Doctor)"         },
  technician: { address: process.env.DEVICE_TECH_ADDRESS,      name: "Tech Johnson (Technician)"  },
  emergency:  { address: process.env.DEVICE_EMERGENCY_ADDRESS, name: "Emergency Device"            },
  attacker:   { address: "0xRogueDevice0000000000000000000000000999", name: "❌ Rogue Attacker"   },
};

// Pre-defined signal scenarios
const SCENARIOS = {
  "1": {
    label: "✅ Normal heartbeat (Authorized)",
    signal: { frequency: "72", previousFrequency: "70", sender: DEVICES.doctor.address },
    description: "Normal 72 bpm signal from authorized doctor — should PASS all checks"
  },
  "2": {
    label: "🚨 Abnormal frequency spike",
    signal: { frequency: "135", previousFrequency: "72", sender: DEVICES.doctor.address },
    description: "Dangerous 135 bpm spike — IDS should FLAG and block"
  },
  "3": {
    label: "🚨 Unauthorized sender (Attacker)",
    signal: { frequency: "75", previousFrequency: "73", sender: DEVICES.attacker.address },
    description: "Signal from unknown/unregistered device — IDS should BLOCK as unauthorized"
  },
  "4": {
    label: "🚨 Malicious command injection",
    signal: { frequency: "70", previousFrequency: "68", sender: DEVICES.doctor.address, command: "stop; rm -rf" },
    description: "Authorized sender but malicious command pattern — IDS should BLOCK"
  },
  "5": {
    label: "✅ Firmware update signal (Technician)",
    signal: { frequency: "74", previousFrequency: "73", sender: DEVICES.technician.address },
    description: "Normal signal from technician — should PASS"
  },
  "6": {
    label: "🚨 Abnormal low frequency",
    signal: { frequency: "25", previousFrequency: "68", sender: DEVICES.doctor.address },
    description: "Dangerously low 25 bpm — IDS should FLAG as abnormal"
  },
  "7": {
    label: "🚨 Emergency device signal",
    signal: { frequency: "78", previousFrequency: "74", sender: DEVICES.emergency.address },
    description: "Emergency device sending — should PASS (authorized)"
  },
  "8": {
    label: "🔁 Run ALL scenarios in sequence",
    description: "Runs scenarios 1-7 automatically with 2 second gaps"
  }
};

// Summary counters
let totalSent = 0, totalSafe = 0, totalThreat = 0, totalError = 0;

function printMenu() {
  console.log("\n" + "═".repeat(65));
  console.log("  🫀 ZTAPS INTERACTIVE PACEMAKER SIMULATOR");
  console.log("  Backend:", BACKEND, "| Watch IDS Alerts page in browser!");
  console.log("═".repeat(65));
  for (const [key, scenario] of Object.entries(SCENARIOS)) {
    console.log(`  ${key}. ${scenario.label}`);
    console.log(`     ${scenario.description}`);
  }
  console.log("  0. Exit and show summary");
  console.log("═".repeat(65));
  process.stdout.write("\nChoose scenario (0-8): ");
}

async function sendSignal(signal) {
  totalSent++;

  console.log("\n" + "─".repeat(65));
  console.log("📡 SIGNAL SENT:");
  console.log(`   Frequency : ${signal.frequency} bpm (prev: ${signal.previousFrequency} bpm)`);
  console.log(`   Sender    : ${signal.sender}`);
  if (signal.command) console.log(`   Command   : ${signal.command}`);

  // Layer 2 — Edge IDS check (local, no blockchain yet)
  console.log("\n🔍 LAYER 2 — Edge IDS check...");
  const idsResult = analyzeSignal(signal);

  if (idsResult) {
    // Threat detected at edge — log to blockchain
    console.log(`   🚨 THREAT DETECTED: ${idsResult.type} | Severity: ${idsResult.severity}`);
    console.log("\n📤 LAYER 3 — Logging to Blockchain + IPFS + MySQL...");

    try {
      const res = await axios.post(`${BACKEND}/api/ids-alerts`, {
        patientId:         "P-DEMO-01",
        patientDetails:    "Demo Patient | Interactive Simulator",
        attackType:        idsResult.type,
        alteredFrequency:  signal.frequency,
        previousFrequency: signal.previousFrequency,
        source:            signal.sender,
        severity:          idsResult.severity,
        deviceModel:       "PM-Interactive-X1",
        riskCategory:      "Device Layer",
      });

      totalThreat++;
      console.log(`   ✅ Alert logged on-chain!`);
      console.log(`   TX Hash : ${res.data.txHash}`);
      console.log(`   Block   : ${res.data.blockNumber}`);
      console.log(`   IPFS    : ${res.data.ipfsHash}`);
      console.log(`   MySQL   : ${res.data.mirroredToMySQL ? "✅ Mirrored" : "⚠️ Not mirrored"}`);
      console.log("\n   🛡️  RESULT: BLOCKED — Check IDS Alerts page in browser!");

    } catch (err) {
      totalError++;
      console.error(`   ❌ Backend error: ${err.message}`);
    }

  } else {
    // Safe signal — log as access
    console.log("   ✅ SAFE — signal passes Edge IDS check");
    console.log("\n📤 LAYER 3 — Logging access to Blockchain + MySQL...");

    try {
      const res = await axios.post(`${BACKEND}/api/access-logs`, {
        purpose: `Telemetry signal: ${signal.frequency} bpm`,
      });

      totalSafe++;
      console.log(`   ✅ Access logged on-chain!`);
      console.log(`   TX Hash : ${res.data.txHash}`);
      console.log(`   Block   : ${res.data.blockNumber}`);
      console.log("\n   ✅ RESULT: ACCEPTED — Check Access Logs in browser!");

    } catch (err) {
      totalError++;
      console.error(`   ❌ Backend error: ${err.message}`);
    }
  }
}

async function runAll() {
  console.log("\n🔄 Running ALL scenarios in sequence...\n");
  for (const [key, scenario] of Object.entries(SCENARIOS)) {
    if (key === "8") continue;
    console.log(`\n▶  Scenario ${key}: ${scenario.label}`);
    await sendSignal(scenario.signal);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("\n✅ All scenarios completed!");
}

function printSummary() {
  console.log("\n" + "═".repeat(65));
  console.log("  📊 SESSION SUMMARY");
  console.log("═".repeat(65));
  console.log(`  Total signals sent : ${totalSent}`);
  console.log(`  ✅ Safe (accepted) : ${totalSafe}`);
  console.log(`  🚨 Threats blocked : ${totalThreat}`);
  console.log(`  ❌ Errors          : ${totalError}`);
  console.log("═".repeat(65));
  console.log("  All data is in:");
  console.log("  • Blockchain (permanent, immutable)");
  console.log("  • MySQL (fast-query mirror)");
  console.log("  • Pinata IPFS (for threat alerts)");
  console.log("  • Frontend dashboard (auto-refreshed)");
  console.log("═".repeat(65) + "\n");
}

async function main() {
  console.clear();
  console.log("Starting interactive simulator...");
  console.log("Make sure:");
  console.log("  1. Hardhat node is running (npx hardhat node)");
  console.log("  2. Contracts deployed (npx hardhat run scripts/deployAll.js --network localhost)");
  console.log("  3. Backend running (node Backend/index.js)");
  console.log("  4. Frontend open at http://localhost:3000 → IDS Alerts page");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const askMenu = () => {
    printMenu();
    rl.once("line", async (input) => {
      const choice = input.trim();

      if (choice === "0") {
        printSummary();
        rl.close();
        return;
      }

      if (choice === "8") {
        await runAll();
      } else if (SCENARIOS[choice]) {
        await sendSignal(SCENARIOS[choice].signal);
      } else {
        console.log("  Invalid choice. Try again.");
      }

      askMenu();
    });
  };

  askMenu();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});