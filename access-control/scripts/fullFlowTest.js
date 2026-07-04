// scripts/fullFlowTest.js
require("dotenv").config({ path: "../.env" });
const hre = require("hardhat");
const { analyzeSignal } = require("./idsEngine");
const { uploadToIPFS } = require("./ipfsUploader");

async function main() {
  const [admin] = await hre.ethers.getSigners();

  // Deploy PacemakerIDSLogger fresh for this test
  const ContractFactory = await hre.ethers.getContractFactory("PacemakerIDSLogger");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ PacemakerIDSLogger deployed at: ${address}\n`);

  // Register admin as authorized device
  await contract.registerDevice(admin.address, admin.address);
  console.log(`✅ Admin registered as authorized device\n`);

  // Test signals — use real addresses from .env
  const signals = [
    {
      patientId: "PAT001",
      patientDetails: "John Doe, Age 65, DeviceID: PM123X",
      frequency: "100",
      previousFrequency: "72",
      sender: "0xAttackerWalletInvalidAddress999", // unauthorized
    },
    {
      patientId: "PAT002",
      patientDetails: "Jane Smith, Age 58, DeviceID: PM456Y",
      frequency: "70",
      previousFrequency: "72",
      sender: process.env.DEVICE_DOCTOR_ADDRESS, // authorized
    },
  ];

  for (const signal of signals) {
    console.log(`\n📡 Processing signal for patient: ${signal.patientId}`);
    const result = analyzeSignal(signal);

    if (result) {
      console.log(`🚨 Threat Detected: ${result.type} | Severity: ${result.severity}`);

      const alertData = {
        patientId:         signal.patientId,
        patientDetails:    signal.patientDetails,
        attackType:        result.type,
        alteredFrequency:  result.alteredFrequency,
        previousFrequency: result.previousFrequency,
        source:            result.source,
        severity:          result.severity,
        detectedAt:        new Date().toISOString(),
      };

      console.log("📤 Uploading alert to Pinata IPFS...");
      const ipfsHash = await uploadToIPFS(alertData);
      console.log(`📦 IPFS CID: ${ipfsHash}`);

      const tx = await contract.logIDSAlert(
        signal.patientId,
        signal.patientDetails,
        result.type,
        result.alteredFrequency,
        result.previousFrequency,
        result.source,
        ipfsHash,
        result.severity,
        "PM-MockModelX",
        "Medium"
      );
      await tx.wait();
      console.log("✅ IDS Alert logged on blockchain");

    } else {
      console.log("✅ Signal is safe. Logging approved command...");

      const safeCommand = `adjustPulseRate(${signal.frequency})`;
      const cmdTx = await contract.logApprovedCommand(
        safeCommand,
        signal.patientId,
        signal.sender
      );
      await cmdTx.wait();
      console.log("✅ Approved command logged on blockchain");
    }
  }

  // Fetch and display logs
  console.log(`\n📦 Fetching logs for all patients:`);
  for (const id of ["PAT001", "PAT002"]) {
    const alerts = await contract.getAlertsByPatient(id);
    console.log(`\n🔍 IDS Alerts for ${id} (${alerts.length} found):`);
    for (const alertId of alerts) {
      const alert = await contract.getAlert(alertId);
      console.log(`   Alert #${Number(alertId)}: ${alert.attackType} | Severity: ${alert.severity}`);
    }

    const commands = await contract.getApprovedCommandsByPatient(id);
    console.log(`✅ Approved Commands for ${id} (${commands.length} found):`);
    for (const cmdId of commands) {
      const cmd = await contract.getApprovedCommand(cmdId);
      console.log(`   Cmd #${Number(cmdId)}: ${cmd.command}`);
    }
  }

  console.log("\n🎉 Full flow test complete!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exitCode = 1;
});