// SPDX-License-Identifier: MIT
const hre = require("hardhat");
const { ethers } = require("ethers");
const readline = require("readline");
const prompt = require("prompt-sync")({ sigint: true });

const ADMIN_PASSWORD = "admin123";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  const factory = await hre.ethers.getContractFactory("CommandValidator", wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`✅ Deployed at: ${address}`);

  console.log("\n👂 Listening for contract events...\n");

  contract.on("CommandAccepted", (sender, command, time) => {
    console.log(`\n✨ EVENT: Command Accepted!
      Sender: ${sender}
      Command: ${command}
      Timestamp: ${new Date(Number(time) * 1000).toLocaleString()}
    `);
  });

  contract.on("CommandRejected", (sender, reason, time) => {
    console.log(`\n🚨 EVENT: Command Rejected!
      Sender: ${sender}
      Reason: ${reason}
      Timestamp: ${new Date(Number(time) * 1000).toLocaleString()}
    `);
  });

  contract.on("Paused", (isPaused) => {
    console.log(`\n🚦 EVENT: System ${isPaused ? "PAUSED" : "UNPAUSED"}!`);
  });

  contract.on("AdminAdded", (admin) => {
    console.log(`\n👤 EVENT: Admin Added! Address: ${admin}`);
  });

  contract.on("AdminRemoved", (admin) => {
    console.log(`\n❌ EVENT: Admin Removed! Address: ${admin}`);
  });

  contract.on("UserBlacklisted", (user) => {
    console.log(`\n🚫 EVENT: User Blacklisted! Address: ${user}`);
  });

  contract.on("UserWhitelisted", (user) => {
    console.log(`\n✅ EVENT: User Whitelisted! Address: ${user}`);
  });

  contract.on("EmergencyLockdownTriggered", (triggeredBy, timestamp, reason) => {
    console.log(`\n🚨 EVENT: Emergency Lockdown Triggered!
      Triggered By: ${triggeredBy}
      Reason: ${reason}
      Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}
    `);
  });

  contract.on("CommandLogged", (user, command, timestamp) => {
      console.log(`\n📜 EVENT: Command Logged (raw)!
        User: ${user}
        Command: ${command}
        Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}
      `);
  });

  contract.on("ThreatReported", (reporter, reason, timestamp) => {
    console.log(`\n🚩 EVENT: Threat Reported!
      Reporter: ${reporter}
      Reason: ${reason}
      Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}
    `);
  });


  const inputPassword = prompt("Enter admin password: ", { echo: "*" });

  if (inputPassword !== ADMIN_PASSWORD) {
    console.log("❌ Incorrect password. Access denied.");
    process.exit(1);
  }

  const owner = await contract.owner();
  const isAdmin = await contract.isAdmin(wallet.address);
  const role = wallet.address === owner ? "Owner" : isAdmin ? "Admin" : "User";

  console.log(`\n✅ Access granted. Role: ${role} (${wallet.address})`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
  }


  async function showMenu() {
    console.log(`
===============================
      COMMAND VALIDATOR CLI
===============================
1. Submit Command
2. View Allowed Commands
3. Add Command ${role !== "User" ? "(Admin/Owner)" : "(❌ Restricted)"}
4. Update Cooldown ${role !== "User" ? "(Admin/Owner)" : "(❌ Restricted)"}
5. View Cooldown Time
6. Pause/Unpause ${role === "Owner" ? "(Owner)" : "(❌ Restricted)"}
7. Add Admin ${role === "Owner" ? "(Owner)" : "(❌ Restricted)"}
8. Remove Admin ${role === "Owner" ? "(Owner)" : "(❌ Restricted)"}
9. Blacklist User ${role !== "User" ? "(Admin/Owner)" : "(❌ Restricted)"}
10. Whitelist User ${role !== "User" ? "(Admin/Owner)" : "(❌ Restricted)"}
11. Reset Cooldown ${role !== "User" ? "(Admin/Owner)" : "(❌ Restricted)"}
12. View Nonce
--- NEW ADD-ONS ---
13. Trigger Emergency Lockdown (Owner)
14. Add Approved Firmware Hash (Admin/Owner)
15. Submit Firmware Command
16. Report Threat
17. Add Blocked Pattern (Admin/Owner)
18. Remove Blocked Pattern (Admin/Owner)
19. View Blocked Patterns
20. Exit
===============================
`);

    rl.question("Choose option: ", async (choice) => {
      const adminOrOwner = role === "Admin" || role === "Owner";
      const ownerOnly = role === "Owner";

      try {
        switch (choice.trim()) {
          case "1":
            const cmd1 = await ask("Enter command: ");
            try {
              const tx = await contract.submitCommand(cmd1);
              await tx.wait();
              console.log("✅ Command submitted.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "2":
            const cmds = await contract.getAllowedCommands();
            console.log("📋 Allowed Commands:", cmds);
            showMenu();
            break;

          case "3":
            if (!adminOrOwner) return noAccess("Admin/Owner");
            const cmd3 = await ask("Command to add: ");
            try {
              const tx = await contract.addCommand(cmd3);
              await tx.wait();
              console.log("✅ Command added.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "4":
            if (!adminOrOwner) return noAccess("Admin/Owner");
            const seconds5 = await ask("New cooldown (seconds): ");
            try {
              const tx = await contract.updateCooldown(Number(seconds5));
              await tx.wait();
              console.log("✅ Cooldown updated.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "5":
            const cooldown = await contract.cooldown();
            console.log(`⏱ Cooldown: ${cooldown.toString()}s`);
            showMenu();
            break;

          case "6":
            if (!ownerOnly) return noAccess("Owner");
            try {
              const tx7 = await contract.togglePause();
              await tx7.wait();
              const isCurrentlyPaused = await contract.paused();
              console.log(`🚨 Pause state toggled. System is now ${isCurrentlyPaused ? "PAUSED" : "UNPAUSED"}.`);
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "7":
            if (!ownerOnly) return noAccess("Owner");
            const adminAddr8 = await ask("Admin to add: ");
            if (!ethers.isAddress(adminAddr8)) return invalidAddr();
            try {
              const tx = await contract.addAdmin(adminAddr8.trim());
              await tx.wait();
              console.log("✅ Admin added.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "8":
            if (!ownerOnly) return noAccess("Owner");
            const adminAddr9 = await ask("Admin to remove: ");
            if (!ethers.isAddress(adminAddr9)) return invalidAddr();
            try {
              const tx = await contract.removeAdmin(adminAddr9.trim());
              await tx.wait();
              console.log("✅ Admin removed.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "9":
            if (!adminOrOwner) return noAccess("Admin/Owner");
            const userAddr10 = await ask("Address to blacklist: ");
            if (!ethers.isAddress(userAddr10)) return invalidAddr();
            try {
              const tx = await contract.blacklistUser(userAddr10.trim());
              await tx.wait();
              console.log("✅ User blacklisted.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "10":
            if (!adminOrOwner) return noAccess("Admin/Owner");
            const userAddr11 = await ask("Address to whitelist: ");
            if (!ethers.isAddress(userAddr11)) return invalidAddr();
            try {
              const tx = await contract.whitelistUser(userAddr11.trim());
              await tx.wait();
              console.log("✅ User whitelisted.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "11": // Re-added: Reset Cooldown
            if (!adminOrOwner) return noAccess("Admin/Owner");
            const userAddr12 = await ask("Address to reset cooldown: ");
            if (!ethers.isAddress(userAddr12)) return invalidAddr();
            try {
              const tx = await contract.resetCooldown(userAddr12.trim());
              await tx.wait();
              console.log("✅ Cooldown reset.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error:", errorMessage);
            }
            showMenu();
            break;

          case "12": // Re-added: View Nonce
            const nonce = await contract.getNonce(wallet.address);
            console.log("🔢 Nonce:", nonce.toString());
            showMenu();
            break;
            
          case "13": // Shifted from 11
            if (!ownerOnly) return noAccess("Owner");
            const lockdownReason = await ask("Reason for emergency lockdown: ");
            try {
              const tx = await contract.triggerEmergencyLockdown(lockdownReason);
              await tx.wait();
              console.log("🚨 Emergency Lockdown Triggered!");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error triggering lockdown:", errorMessage);
            }
            showMenu();
            break;

          case "14": // Shifted from 12
            if (!adminOrOwner) return noAccess("Admin/Owner");
            const firmwareHash = await ask("Firmware hash to approve: ");
            try {
              const tx = await contract.addApprovedFirmwareHash(firmwareHash);
              await tx.wait();
              console.log("✅ Firmware hash approved.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error adding firmware hash:", errorMessage);
            }
            showMenu();
            break;

          case "15": // Shifted from 13
            const firmwareCmdHash = await ask("Firmware command hash to submit: ");
            try {
              const tx = await contract.submitFirmwareCommand(firmwareCmdHash);
              await tx.wait();
              console.log("✅ Firmware command submitted.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error submitting firmware command:", errorMessage);
            }
            showMenu();
            break;

          case "16": // Shifted from 14
            const threatReason = await ask("Reason for reporting threat: ");
            try {
              const tx = await contract.reportThreat(threatReason);
              await tx.wait();
              console.log("✅ Threat reported.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error reporting threat:", errorMessage);
            }
            showMenu();
            break;

          case "17": // Shifted from 15
            if (!adminOrOwner) return noAccess("Admin/Owner");
            const blockedPatternAdd = await ask("Pattern to block: ");
            try {
              const tx = await contract.addBlockedPattern(blockedPatternAdd);
              await tx.wait();
              console.log("✅ Blocked pattern added.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error adding blocked pattern:", errorMessage);
            }
            showMenu();
            break;

          case "18": // Shifted from 16
            if (!adminOrOwner) return noAccess("Admin/Owner");
            const blockedPatternRemove = await ask("Pattern to remove: ");
            try {
              const tx = await contract.removeBlockedPattern(blockedPatternRemove);
              await tx.wait();
              console.log("✅ Blocked pattern removed.");
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error removing blocked pattern:", errorMessage);
            }
            showMenu();
            break;

          case "19": // Shifted from 17
            try {
              const blockedPatterns = await contract.getBlockedPatterns();
              console.log("🚫 Blocked Patterns:", blockedPatterns);
            } catch (err) {
              const errorMessage = err.reason || (err.data && err.data.message) || err.message;
              console.log("❌ Error viewing blocked patterns:", errorMessage);
            }
            showMenu();
            break;

          case "20": // Shifted from 18
            console.log("Exiting . Goodbye!");
            rl.close();
            process.exit(0);
            break;

          default:
            console.log("❗ Invalid option.");
            showMenu();
        }
      } catch (err) {
        const errorMessage = err.reason || (err.data && err.data.message) || err.message;
        console.error("❌ Unexpected Error:", errorMessage);
        showMenu();
      }
    });
  }

  function noAccess(requiredRole = "") {
    console.log(`🚫 Access denied for your role. ${requiredRole ? `This requires ${requiredRole} privileges.` : ""}`);
    showMenu();
  }

  function invalidAddr() {
    console.log("❗ Invalid Ethereum address.");
    showMenu();
  }

  showMenu();
}

main().catch((err) => {
  const errorMessage = err.reason || (err.data && err.data.message) || err.message;
  console.error("❌ Fatal Error:", errorMessage);
  process.exit(1);
});



//npx hardhat clean
//npx hardhat compile
//npx hardhat run scripts/deployValidator.js --network localhost
//npx hardhat run scripts/test1.js --network localhost
