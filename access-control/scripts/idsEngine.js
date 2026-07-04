// scripts/idsEngine.js
// Edge-layer IDS check — runs locally on the simulated pacemaker signal
// BEFORE it ever reaches the backend/blockchain, matching the "Device Layer /
// Intrusion Detection" box in the system architecture diagram.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

function analyzeSignal(signal) {
  const { frequency, sender, previousFrequency } = signal;

  if (parseInt(frequency) > 90) {
    return {
      type: "Abnormal Frequency Spike",
      alteredFrequency: frequency,
      previousFrequency,
      source: sender,
      severity: "High"
    };
  }

  const authorizedSenders = [
    process.env.DEVICE_DOCTOR_ADDRESS,
    process.env.DEVICE_TECH_ADDRESS,
    process.env.DEVICE_EMERGENCY_ADDRESS,
    process.env.ADMIN_ADDRESS,
  ].filter(Boolean);

  if (!authorizedSenders.includes(sender)) {
    return {
      type: "Unauthorized Command Injection",
      alteredFrequency: frequency,
      previousFrequency,
      source: sender,
      severity: "High"
    };
  }

  return null; // Safe signal
}

module.exports = { analyzeSignal };