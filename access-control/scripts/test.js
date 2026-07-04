/*
const { ethers } = require("ethers");
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const { Parser } = require("json2csv");

const ABI = require("../artifacts/contracts/UnauthorizedAccessControl.sol/UnauthorizedAccessControl.json").abi;
const ADDRESS = fs.readFileSync("deployedAddress.txt", "utf8").trim();

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = provider.getSigner();
const contract = new ethers.Contract(ADDRESS, ABI, signer);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
    while (true) {
        console.log("\n======= ACCESS CONTROL MENU =======");
        console.log("1. Register Roles to Device");
        console.log("2. Revoke Roles from Device");
        console.log("3. Request Access (simulate device)");
        console.log("4. Toggle Emergency Mode");
        console.log("5. View All Access Logs");
        console.log("6. Remove Blacklisted Combo");
        console.log("7. Add Admin");
        console.log("8. Remove Admin");
        console.log("9. Exit");
        const choice = await ask("Enter your choice: ");

        try {
            if (choice === "1") {
                const device = await ask("Enter device address: ");
                const roles = (await ask("Enter roles (comma-separated): ")).split(",");
                const tx = await contract.registerRoles(device.trim(), roles);
                await tx.wait();
                console.log("✅ Roles registered successfully.");

            } else if (choice === "2") {
                const device = await ask("Enter device address: ");
                const tx = await contract.revokeRoles(device.trim());
                await tx.wait();
                console.log("✅ Roles revoked successfully.");

            } else if (choice === "3") {
                const purpose = await ask("Enter access purpose: ");
                const tx = await contract.requestAccess(purpose);
                await tx.wait();
                console.log("🔒 Access request submitted.");

            } else if (choice === "4") {
                const tx = await contract.toggleEmergencyMode();
                await tx.wait();
                console.log("⚠️ Emergency mode toggled.");

            } else if (choice === "5") {
                const logCount = await contract.getLogCount();
                for (let i = 0; i < logCount; i++) {
                    const log = await contract.getAccessLog(i);
                    console.log(`\n[Log ${i + 1}]`);
                    console.log(`User: ${log.user}`);
                    console.log(`Purpose: ${log.purpose}`);
                    console.log(`Roles: ${log.roles}`);
                    console.log(`Success: ${log.success}`);
                    console.log(`Reason: ${log.reason}`);
                    console.log(`Timestamp: ${new Date(log.timestamp * 1000).toLocaleString()}`);
                }

            } else if (choice === "6") {
                const role = await ask("Enter role: ");
                const purpose = await ask("Enter purpose: ");
                const tx = await contract.removeBlacklistedCombo(role, purpose);
                await tx.wait();
                console.log("🚫 Blacklisted combo removed.");

            } else if (choice === "7") {
                const newAdmin = await ask("Enter new admin address: ");
                const tx = await contract.addAdmin(newAdmin.trim());
                await tx.wait();
                console.log("👑 New admin added.");

            } else if (choice === "8") {
                const adminToRemove = await ask("Enter admin address to remove: ");
                const tx = await contract.removeAdmin(adminToRemove.trim());
                await tx.wait();
                console.log("👋 Admin removed.");

            } else if (choice === "9") {
                console.log("🚪 Exiting...");
                break;

            } else {
                console.log("❌ Invalid choice. Try again.");
            }

        } catch (error) {
            console.error("⚠️ Error during operation:", error.message);
        }
    }

    rl.close();
}

main();
*/


require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const readline = require("readline");
const { Parser } = require("json2csv");
const path = require("path");

const ABI = require("../artifacts/contracts/UnauthorizedAccessControl.sol/UnauthorizedAccessControl.json").abi;
const ADDRESS = fs.readFileSync("deployedAddress.txt", "utf8").trim();
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

const ADMIN = {
    address: process.env.ADMIN_ADDRESS,
    privateKey: process.env.ADMIN_PRIVATE_KEY,
    password: process.env.ADMIN_PASSWORD
};

const DEVICES = {
    doctor: {
        address: process.env.DEVICE_DOCTOR_ADDRESS,
        privateKey: process.env.DEVICE_DOCTOR_KEY,
        role: "doctor",
        password: process.env.DEVICE_DOCTOR_PASSWORD
    },
    technician: {
        address: process.env.DEVICE_TECH_ADDRESS,
        privateKey: process.env.DEVICE_TECH_KEY,
        role: "technician",
        password: process.env.DEVICE_TECH_PASSWORD
    },
    emergency: {
        address: process.env.DEVICE_EMERGENCY_ADDRESS,
        privateKey: process.env.DEVICE_EMERGENCY_KEY,
        role: "emergency",
        password: process.env.DEVICE_EMERGENCY_PASSWORD
    }
};

async function adminMenu(contract) {
    while (true) {
        console.log(`
======= ADMIN MENU =======
1. Register roles for device
2. Revoke roles from device
3. Toggle emergency mode
4. Remove blacklisted combo
5. Add admin
6. Remove admin
7. View access logs
8. Export logs to CSV
9. View emergency mode status
10. View roles of a device
11. Register Doctor 
12. Register Patient 
13. View Patient Info 
14. View Doctor's Patients 
15. Add Doctor 
16. Logout
==========================
`);
        const choice = await ask("Enter choice: ");
        try {
            if (choice === "1") {
                const device = await ask("Enter device address: ");
                const rolesStr = await ask("Enter roles (comma-separated): ");
                const roles = rolesStr.split(",").map(r => r.trim());
                const tx = await contract.registerRoles(device.trim(), roles);
                await tx.wait();
                console.log("✅ Roles registered.");
            } else if (choice === "2") {
                const device = await ask("Enter device address: ");
                const tx = await contract.revokeRoles(device.trim());
                await tx.wait();
                console.log("✅ Roles revoked.");
            } else if (choice === "3") {
                const tx = await contract.toggleEmergencyMode();
                await tx.wait();
                console.log("✅ Emergency mode toggled.");
            } else if (choice === "4") {
                const role = await ask("Enter role: ");
                const purpose = await ask("Enter purpose: ");
                const tx = await contract.removeBlacklistedCombo(role.trim(), purpose.trim());
                await tx.wait();
                console.log("✅ Blacklisted combo removed.");
            } else if (choice === "5") {
                const newAdmin = await ask("Enter new admin address: ");
                const tx = await contract.addAdmin(newAdmin.trim());
                await tx.wait();
                console.log("✅ Admin added.");
            } else if (choice === "6") {
                const addr = await ask("Enter admin address to remove: ");
                const tx = await contract.removeAdmin(addr.trim());
                await tx.wait();
                console.log("✅ Admin removed.");
            } else if (choice === "7") {
                const count = await contract.getLogCount();
                console.log(`📚 Total Logs: ${count.toString()}`);
                for (let i = 0; i < Number(count); i++) {
                    const log = await contract.getAccessLog(i);
                    console.log(`\n[Log ${i + 1}]
➤ User: ${log.user}
➤ Purpose: ${log.purpose}
➤ Roles: ${log.roles.join(", ")}
➤ Status: ${log.success ? "✅ Granted" : "❌ Denied"}
➤ Reason: ${log.reason}
➤ Time: ${new Date(Number(log.timestamp) * 1000).toLocaleString()}`);
                }
            } else if (choice === "8") {
                const count = await contract.getLogCount();
                const allLogs = [];
                for (let i = 0; i < Number(count); i++) {
                    const log = await contract.getAccessLog(i);
                    allLogs.push({
                        user: log.user,
                        purpose: log.purpose,
                        roles: log.roles.join(";"),
                        status: log.success ? "Granted" : "Denied",
                        reason: log.reason,
                        timestamp: new Date(Number(log.timestamp) * 1000).toLocaleString()
                    });
                }
                const parser = new Parser({ fields: ["user", "purpose", "roles", "status", "reason", "timestamp"] });
                fs.writeFileSync("access_logs.csv", parser.parse(allLogs));
                console.log("✅ Logs exported to access_logs.csv");
            } else if (choice === "9") {
                const mode = await contract.emergencyMode();
                console.log(`Emergency mode is ${mode ? "ON" : "OFF"}`);
            } else if (choice === "10") {
                const device = await ask("Enter device address: ");
                const roles = await contract.getRoles(device.trim());
                console.log(`Roles assigned to ${device}: ${roles.join(", ")}`);
            } else if (choice === "11") {
                const doctor = await ask("Enter doctor address: ");
                const tx = await contract.addDoctorNew(doctor.trim());
                await tx.wait();
                console.log("✅ Doctor registered (Original System).");
            } else if (choice === "12") {
                const patient = await ask("Enter patient address: ");
                const name = await ask("Enter patient name: ");
                const ageStr = await ask("Enter patient age: ");
                const age = parseInt(ageStr);
                const history = await ask("Enter medical history: ");
                const doctor = await ask("Enter assigned doctor address: ");
                const tx = await contract.registerPatient(patient.trim(), name, age, history, doctor.trim());
                await tx.wait();
                console.log("✅ Patient registered (Original System).");
            } else if (choice === "13") {
                const patient = await ask("Enter patient address: ");
                const info = await contract.getPatientInfo(patient.trim());
                console.log(`Name: ${info[0]}, Age: ${info[1]}, Medical History: ${info[2]}`);
            } else if (choice === "14") {
                const doctor = await ask("Enter doctor address: ");
                const patients = await contract.getDoctorPatients(doctor.trim());
                console.log(`Patients of doctor ${doctor}:`);
                patients.forEach((p, i) => console.log(`${i + 1}. ${p}`));
            } else if (choice === "15") {
                const doctor = await ask("Enter doctor address: ");
                const tx = await contract.addDoctorNew(doctor.trim());
                await tx.wait();
                console.log("✅ Doctor added (New System).");
            } else if (choice === "16") {
                console.log("👋 Logging out...");
                break;
            } else {
                console.log("❌ Invalid choice.");
            }
        } catch (err) {
            console.error("⚠️ Error:", err.reason || err.message);
        }
    }
}

async function deviceMenu(device) {
    const wallet = new ethers.Wallet(device.privateKey, provider);
    const contract = new ethers.Contract(ADDRESS, ABI, wallet);

    if (device.role === "technician") {
        while (true) {
            console.log(`\n======= FIRMWARE UPDATE MENU (Technician) =======`);
            console.log("1. Verify firmware integrity (checksum)");
            console.log("2. Upload new firmware version (On-chain)");
            console.log("3. View firmware version history (On-chain)");
            console.log("4. Rollback to previous version");
            console.log("5. Sign firmware with admin key");
            console.log("6. View firmware access logs");
            console.log("7. Check device compatibility");
            console.log("8. Logout");
            console.log("====================================");
            const choice = await ask("Enter choice: ");

            try {
                switch (choice) {
                    case "1":
                        const enteredChecksum = await ask("Enter firmware checksum/hash to verify: ");
                        const expectedChecksum = "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"; 

                        if (enteredChecksum.trim().toLowerCase() === expectedChecksum.toLowerCase()) {
                            console.log("✅ Firmware integrity verified: Checksum matches.");
                        } else {
                            console.log("❌ Firmware integrity check failed: Checksum does NOT match.");
                            console.log(`(Expected: ${expectedChecksum}, Received: ${enteredChecksum})`);
                        }
                        break;
                    case "2":
                        const deviceId = await ask("Enter device ID: ");
                        const version = await ask("Enter new firmware version: ");
                        const firmwareHash = await ask("Enter firmware hash: ");
                        const tx = await contract.updateFirmware(deviceId.trim(), version.trim(), firmwareHash.trim());
                        await tx.wait();
                        console.log(`✅ Firmware version ${version} uploaded successfully for device ${deviceId}.`);
                        break;
                    case "3":
                        const count = await contract.getFirmwareUpdateCount();
                        if (Number(count) === 0) {
                            console.log("No firmware update history found.");
                        } else {
                            console.log(`📚 Total Firmware Updates: ${count.toString()}`);
                            for (let i = 0; i < Number(count); i++) {
                                const log = await contract.getFirmwareUpdate(i);
                                console.log(`\n[Update ${i + 1}]
➤ Device ID: ${log[0]}
➤ Version: ${log[1]}
➤ Hash: ${log[2]}
➤ Updated By: ${log[3]}
➤ Time: ${new Date(Number(log[4]) * 1000).toLocaleString()}`);
                            }
                        }
                        break;
                    case "4":
                        console.log("Rolled back to previous firmware version: v1.1");
                        break;
                    case "5":
                        console.log("\nSimulating firmware signing by Admin...");
                        const firmwareToSignHash = await ask("Enter firmware hash to be signed by Admin: ");
                        
                        console.log(`✅ Firmware hash "${firmwareToSignHash}" conceptually signed by Admin.`);
                        break;
                    case "6":
                        console.log("Firmware Access Logs:\n- [2025-07-27] Upload: v2.0\n- [2025-07-25] Rollback to v1.1");
                        break;
                    case "7":
                        const deviceModel = await ask("Enter device model to check compatibility for: ");
                        const currentFwVersion = await ask("Enter current firmware version on device: ");
                        
                        console.log(`\nChecking compatibility for Model: ${deviceModel}, Current FW: ${currentFwVersion}...`);
                        
                        if (deviceModel.includes("X1") && currentFwVersion.startsWith("v1.")) {
                            console.log("✅ Device compatibility check: PASSED (Compatible with X1 series v1.x firmware).");
                        } else {
                            console.log("⚠️ Device compatibility check: FAILED (Incompatible or unknown model/firmware combination).");
                        }
                        break;
                    case "8":
                        console.log("👋 Logging out...");
                        return;
                    default:
                        console.log("❌ Invalid choice.");
                }
            } catch (err) {
                console.error("⚠️ Error:", err.reason || err.message);
            }
        }
    } else if (device.role === "emergency") {
        while (true) {
            console.log(`\n======= EMERGENCY MENU =======`);
            console.log("1. Trigger Emergency");
            console.log("2. Resolve Emergency");
            console.log("3. Get Emergency Status");
            console.log("4. Log Emergency Event");
            console.log("5. View Emergency Logs");
            console.log("6. Get Last Emergency Timestamp");
            console.log("7. Get Emergency Count");
            console.log("8. Check if Emergency is Active");
            console.log("9. Get Emergency by Index");
            console.log("10. Clear Emergency Logs");
            console.log("11. Logout");
            console.log("==============================");

            const choice = await ask("Enter choice: ");

            try {
                switch (choice) {
                    case "1":
                        await contract.triggerEmergency("Emergency triggered due to critical issue.");
                        console.log("🚨 Emergency triggered.");
                        break;
                    case "2":
                        await contract.resolveEmergency();
                        console.log("✅ Emergency resolved.");
                        break;
                    case "3":
                        const status = await contract.isEmergencyActive();
                        console.log("📟 Emergency status:", status ? "Active" : "Inactive");
                        break;
                    case "4":
                        const msg = await ask("Enter emergency log message: ");
                        await contract.logEmergencyEvent(msg);
                        console.log("📝 Emergency event logged.");
                        break;
                    case "5":
                        const logs = await contract.getEmergencyLogs();
                        if (logs.length === 0) {
                            console.log("No emergency logs found.");
                        } else {
                            logs.forEach((log, index) => {
                                console.log(`${index + 1}. [${new Date(Number(log.timestamp) * 1000).toLocaleString()}] ${log.message}`);
                            });
                        }
                        break;
                    case "6":
                        const lastTime = await contract.getLastEmergencyTime();
                        console.log("🕒 Last emergency at:", new Date(Number(lastTime) * 1000).toLocaleString());
                        break;
                    case "7":
                        const count = await contract.getEmergencyCount();
                        console.log("🔢 Emergency count:", count.toString());
                        break;
                    case "8":
                        const active = await contract.isEmergencyActive();
                        console.log("🚨 Is emergency active?", active);
                        break;
                    case "9":
                        const idx = await ask("Enter log index: ");
                        const entry = await contract.getEmergencyByIndex(idx);
                        console.log(`📄 Log #${idx}: [${new Date(Number(entry.timestamp) * 1000).toLocaleString()}] ${entry.message}`);
                        break;
                    case "10":
                        await contract.clearEmergencyLogs();
                        console.log("🧹 Emergency logs cleared.");
                        break;
                    case "11":
                        console.log("👋 Logging out...");
                        return;
                    default:
                        console.log("❌ Invalid choice.");
                }
            } catch (err) {
                console.error("⚠️ Error:", err.reason || err.message);
            }
        }
    } else if (device.role === "doctor") {
        while (true) {
            console.log(`\n======= DOCTOR MENU =======
1. Request Access
2. View my Access History
3. View Assigned Roles
4. Add/Update Patient Info
5. Add Patient Check-up Detail
6. Get Patient Check-up History
7. Add Appointment
8. Get patient info
9. Update patient checkup details
10. View my appointments
11. Export my access logs to CSV
12. Export my patient details to CSV
13. Logout
===========================
`);

            const choice = await ask("Enter choice: ");

            try {
                if (choice === "1") {
                    const purpose = await ask("Enter purpose: ");
                    const tx = await contract.requestAccess(purpose.trim());
                    await tx.wait();
                    console.log("✅ Access request sent.");
                } else if (choice === "2") {
                    const count = await contract.getLogCount();
                    for (let i = 0; i < Number(count); i++) {
                        const log = await contract.getAccessLog(i);
                        if (log.user.toLowerCase() === device.address.toLowerCase()) {
                            console.log(`\n[Log ${i + 1}]
➤ Purpose: ${log.purpose}
➤ Roles: ${log.roles.join(", ")}
➤ Status: ${log.success ? "✅ Granted" : "❌ Denied"}
➤ Reason: ${log.reason}
➤ Time: ${new Date(Number(log.timestamp) * 1000).toLocaleString()}`);
                        }
                    }
                } else if (choice === "3") {
                    const roles = await contract.getRoles(device.address);
                    console.log("Assigned Roles:", roles.join(", "));
                } else if (choice === "4") {
                    const patientAddress = await ask("Enter patient address: ");
                    const name = await ask("Enter patient name: ");
                    const details = await ask("Enter patient details: ");
                    const tx = await contract.addOrUpdatePatient(patientAddress.trim(), name.trim(), details.trim());
                    await tx.wait();
                    console.log("✅ Patient info added/updated (New System).");
                } else if (choice === "5") {
                    const patientAddress = await ask("Enter patient address: ");
                    const checkupNote = await ask("Enter check-up note: ");
                    const tx = await contract.addCheckupDetail(patientAddress.trim(), checkupNote.trim());
                    await tx.wait();
                    console.log("✅ Check-up detail added (New System).");
                } else if (choice === "6") {
                    const patientAddress = await ask("Enter patient address: ");
                    const history = await contract.getPatientHistory(patientAddress.trim());
                    if (history.length === 0) {
                        console.log("No check-up history found for this patient.");
                    } else {
                        console.log(`📚 Check-up History for ${patientAddress}:`);
                        history.forEach((note, i) => console.log(`${i + 1}. ${note}`));
                    }
                } else if (choice === "7") {
                    const date = await ask("Enter appointment date (e.g., YYYG-MM-DD HH:MM): ");
                    const reason = await ask("Enter appointment reason: ");
                    const tx = await contract.addAppointment(date.trim(), reason.trim());
                    await tx.wait();
                    console.log("✅ Appointment added.");
                } else if (choice === "8") {
                    const patientAddress = await ask("Enter patient address: ");
                    try {
                        const info = await contract.getPatientInfo(patientAddress.trim());
                        console.log(`Name: ${info[0]}, Age: ${info[1]}, Medical History: ${info[2]}`);
                    } catch (err) {
                        console.error("⚠️ Error fetching patient info:", err.reason || err.message);
                    }
                } else if (choice === "9") {
                    const patient = await ask("Enter patient address: ");
                    const details = await ask("Enter new medical history: ");
                    try {
                        const tx = await contract.addCheckupDetail(patient.trim(), `Updated medical history: ${details.trim()}`);
                        await tx.wait();
                        console.log("✅ Patient checkup details updated.");
                    } catch (err) {
                        console.error("⚠️ Error updating medical history:", err.reason || err.message);
                    }
                } else if (choice === "10") {
                    try {
                        const patients = await contract.getDoctorPatients(device.address);
                        if (patients.length === 0) {
                            console.log("📭 No patients assigned to this doctor (Original System).");
                        } else {
                            console.log("📋 Patients Assigned (Original System):");
                            for (let i = 0; i < patients.length; i++) {
                                const info = await contract.getPatientInfo(patients[i]);
                                console.log(`\n[${i + 1}] ${patients[i]}
➤ Name: ${info[0]}
➤ Age: ${info[1]}
➤ Medical History: ${info[2]}`);
                            }
                        }
                    } catch (err) {
                        console.error("⚠️ Error fetching patients:", err.reason || err.message);
                    }
                } else if (choice === "11") {
                    const count = await contract.getLogCount();
                    const myLogs = [];
                    for (let i = 0; i < Number(count); i++) {
                        const log = await contract.getAccessLog(i);
                        if (log.user.toLowerCase() === device.address.toLowerCase()) {
                            myLogs.push({
                                purpose: log.purpose,
                                roles: log.roles.join(";"),
                                status: log.success ? "Granted" : "Denied",
                                reason: log.reason,
                                timestamp: new Date(Number(log.timestamp) * 1000).toLocaleString()
                            });
                        }
                    }
                    if (myLogs.length === 0) {
                        console.log("No logs to export.");
                    } else {
                        const parser = new Parser({ fields: ["purpose", "roles", "status", "reason", "timestamp"] });
                        fs.writeFileSync("device_logs.csv", parser.parse(myLogs));
                        console.log("✅ Logs exported to device_logs.csv");
                    }
                } else if (choice === "12") {
                    console.log("Exporting patient details...");
                    await exportPatientDetailsToCSV(contract, wallet.address);
                    console.log("✅ Patient details exported to CSV.");
                } else if (choice === "13") {
                    console.log("👋 Logging out...");
                    return;
                } else {
                    console.log("❌ Invalid choice.");
                }
            } catch (err) {
                console.error("⚠️ Error:", err.reason || err.message);
            }
        }
    }
}

async function exportPatientDetailsToCSV(contract, doctorAddress) {
    const patientsAssigned = await contract.getDoctorPatients(doctorAddress);
    const patientDetails = [];

    for (const patientAddr of patientsAssigned) {
        try {
            const info = await contract.getPatientInfo(patientAddr);
            patientDetails.push({
                Address: patientAddr,
                Name: info[0],
                Age: info[1],
                "Medical History": info[2]
            });
        } catch (error) {
            console.warn(`Could not fetch details for patient ${patientAddr}: ${error.message}`);
        }
    }

    if (patientDetails.length === 0) {
        console.log("No patient details to export for this doctor.");
        return;
    }

    const fields = ["Address", "Name", "Age", "Medical History"];
    const parser = new Parser({ fields });
    const csv = parser.parse(patientDetails);

    const filename = `patient_details_${doctorAddress.substring(2, 8)}.csv`;
    fs.writeFileSync(filename, csv);
    console.log(`✅ Patient details exported to ${filename}`);
}

async function main() {
    let contract;

    try {
        const adminWallet = new ethers.Wallet(ADMIN.privateKey, provider);
        contract = new ethers.Contract(ADDRESS, ABI, adminWallet);
    } catch (error) {
        console.error("Fatal error initializing contract or admin wallet:", error.message);
        rl.close();
        return;
    }

    while (true) {
        console.log(`
======= LOGIN =======
1. Admin Login
2. Device Login
3. Exit
=====================
`);
        const loginType = await ask("Choose login type: ");

        if (loginType === "1") {
            const password = await ask("Enter admin password: ");
            if (password === ADMIN.password) {
                console.log("✅ Admin login successful!");
                await adminMenu(contract);
            } else {
                console.log("❌ Invalid admin password.");
            }
        } else if (loginType === "2") {
            const role = await ask("Enter device role (doctor/technician/emergency): ");
            const device = DEVICES[role.toLowerCase()];

            if (device) {
                const password = await ask("Enter device password: ");
                if (password === device.password) {
                    console.log(`✅ ${device.role} login successful!`);
                    await deviceMenu(device);
                } else {
                    console.log("❌ Invalid device password.");
                }
            } else {
                console.log("❌ Invalid device role.");
            }
        } else if (loginType === "3") {
            console.log("Exiting...");
            break;
        } else {
            console.log("❌ Invalid login type.");
        }
    }
    rl.close();
}

main().catch(console.error);


//npx hardhat clean
//npx hardhat compile
//npx hardhat run scripts/deploy.js --network localhost
//npx hardhat run scripts/test.js --network localhost