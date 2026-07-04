// scripts/deployAll.js
// Deploys all 4 contracts used by this project, registers the doctor/technician/
// emergency accounts from .env as authorized devices where applicable, and writes
// out a single deployed/addresses.json file (+ copies ABIs) that Backend/index.js
// reads on startup. Run with: npx hardhat run scripts/deployAll.js --network localhost

require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [admin] = await hre.ethers.getSigners();
  console.log("🚀 Deploying all contracts with admin account:", admin.address);

  const deployed = {};

  // 1. UnauthorizedAccessControl (RBAC)
  const adminEnvAddress = process.env.ADMIN_ADDRESS || admin.address;
  const AccessControl = await hre.ethers.getContractFactory("UnauthorizedAccessControl");
  const accessControl = await AccessControl.deploy(adminEnvAddress);
  await accessControl.waitForDeployment();
  deployed.access_control = await accessControl.getAddress();
  console.log("✅ UnauthorizedAccessControl deployed to:", deployed.access_control);

  // 2. CommandValidator (IDS / command allowlist + rate limiting)
  const CommandValidator = await hre.ethers.getContractFactory("CommandValidator");
  const commandValidator = await CommandValidator.deploy();
  await commandValidator.waitForDeployment();
  deployed.command_validator = await commandValidator.getAddress();
  console.log("✅ CommandValidator deployed to:", deployed.command_validator);

  // 3. SecurePacemakerMonitor (signed command + replay/rate-limit protection)
  const Pacemaker = await hre.ethers.getContractFactory("SecurePacemakerMonitor");
  const pacemaker = await Pacemaker.deploy();
  await pacemaker.waitForDeployment();
  deployed.pacemaker_monitor = await pacemaker.getAddress();
  console.log("✅ SecurePacemakerMonitor deployed to:", deployed.pacemaker_monitor);

  // 4. PacemakerIDSLogger (IDS alert logging + command approval + replay protection)
  const IDSLogger = await hre.ethers.getContractFactory("PacemakerIDSLogger");
  const idsLogger = await IDSLogger.deploy();
  await idsLogger.waitForDeployment();
  deployed.ids_logger = await idsLogger.getAddress();
  console.log("✅ PacemakerIDSLogger deployed to:", deployed.ids_logger);

  // Register the doctor/technician/emergency devices from .env (if present) on
  // PacemakerIDSLogger and SecurePacemakerMonitor so they're ready to send commands.
  const deviceEnvKeys = [
    { name: "doctor", address: process.env.DEVICE_DOCTOR_ADDRESS },
    { name: "technician", address: process.env.DEVICE_TECH_ADDRESS },
    { name: "emergency", address: process.env.DEVICE_EMERGENCY_ADDRESS },
  ];

  for (const dev of deviceEnvKeys) {
    if (!dev.address) {
      console.log(`⚠️  Skipping ${dev.name}: no address found in .env`);
      continue;
    }
    try {
      await idsLogger.registerDevice(dev.address, dev.address);
      console.log(`✅ Registered ${dev.name} (${dev.address}) on PacemakerIDSLogger`);
    } catch (e) {
      console.log(`⚠️  Could not register ${dev.name} on PacemakerIDSLogger:`, e.message);
    }
    try {
      await pacemaker.registerDevice(dev.address, dev.address);
      console.log(`✅ Registered ${dev.name} (${dev.address}) on SecurePacemakerMonitor`);
    } catch (e) {
      console.log(`⚠️  Could not register ${dev.name} on SecurePacemakerMonitor:`, e.message);
    }
  }

  // Register doctor and technician roles on UnauthorizedAccessControl, needed for
  // registerPatient/addAppointment/addOrUpdatePatient (doctor) and updateFirmware (technician)
  const doctorAddress = process.env.DEVICE_DOCTOR_ADDRESS;
  const techAddress = process.env.DEVICE_TECH_ADDRESS;
  const emergencyAddress = process.env.DEVICE_EMERGENCY_ADDRESS;

  if (doctorAddress) {
    try {
      await accessControl.addDoctorNew(doctorAddress);
      console.log(`✅ Registered doctor role for ${doctorAddress} on UnauthorizedAccessControl`);
    } catch (e) {
      console.log(`⚠️  Could not register doctor role:`, e.message);
    }
  }
  if (techAddress) {
    try {
      await accessControl.registerRoles(techAddress, ["technician"]);
      console.log(`✅ Registered technician role for ${techAddress} on UnauthorizedAccessControl`);
    } catch (e) {
      console.log(`⚠️  Could not register technician role:`, e.message);
    }
  }
  if (emergencyAddress) {
    try {
      await accessControl.registerRoles(emergencyAddress, ["emergency"]);
      console.log(`✅ Registered emergency role for ${emergencyAddress} on UnauthorizedAccessControl`);
    } catch (e) {
      console.log(`⚠️  Could not register emergency role:`, e.message);
    }
  }

  // Mine a few blocks so the rate-limiter on freshly-deployed contracts doesn't
  // reject the very first real command sent after deployment (see PacemakerSecurity.sol /
  // replay.sol: block.number must exceed lastCommandBlock(0) + 4).
  console.log("⛏️  Mining 5 blocks to clear cold-start rate limit window...");
  for (let i = 0; i < 5; i++) {
    await hre.ethers.provider.send("evm_mine");
  }

  // Write addresses to a single JSON file
  const deployedDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(deployedDir)) fs.mkdirSync(deployedDir);
  fs.writeFileSync(
    path.join(deployedDir, "addresses.json"),
    JSON.stringify(deployed, null, 2)
  );
  console.log("\n📁 Addresses written to deployed/addresses.json");

  // Keep the old files updated too, since other scripts/Python code read these directly
  fs.writeFileSync(path.join(__dirname, "..", "deployedAddress.txt"), deployed.access_control);

  console.log("\n🎉 All contracts deployed successfully!");
  console.log(JSON.stringify(deployed, null, 2));
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});