require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const { uploadToIPFS } = require('../scripts/ipfsUploader');
const { testConnection, insertIdsAlert, insertAccessLog, getIdsAlertsFromDB, getAccessLogsFromDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Blockchain setup
// ---------------------------------------------------------------------------
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(RPC_URL);
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const doctorWallet = process.env.DEVICE_DOCTOR_KEY
  ? new ethers.Wallet(process.env.DEVICE_DOCTOR_KEY, provider)
  : null;
const techWallet = process.env.DEVICE_TECH_KEY
  ? new ethers.Wallet(process.env.DEVICE_TECH_KEY, provider)
  : null;

const ROOT = path.join(__dirname, '..');
const ADDRESSES_PATH = path.join(ROOT, 'deployed', 'addresses.json');
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts', 'contracts');

let addresses = {};
let contracts = {};

function loadAbi(contractFile, contractName) {
  const abiPath = path.join(ARTIFACTS_DIR, contractFile, `${contractName}.json`);
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  return artifact.abi;
}

function initContracts() {
  if (!fs.existsSync(ADDRESSES_PATH)) {
    console.error('❌ deployed/addresses.json not found.');
    console.error('   Run: npx hardhat run scripts/deployAll.js --network localhost');
    console.error('   (from the access-control folder) before starting the backend.');
    return false;
  }

  addresses = JSON.parse(fs.readFileSync(ADDRESSES_PATH, 'utf8'));

  contracts.accessControl = new ethers.Contract(
    addresses.access_control,
    loadAbi('UnauthorizedAccessControl.sol', 'UnauthorizedAccessControl'),
    adminWallet
  );

  const accessControlAbi = loadAbi('UnauthorizedAccessControl.sol', 'UnauthorizedAccessControl');
  contracts.accessControlAsDoctor = doctorWallet
    ? new ethers.Contract(addresses.access_control, accessControlAbi, doctorWallet)
    : null;
  contracts.accessControlAsTech = techWallet
    ? new ethers.Contract(addresses.access_control, accessControlAbi, techWallet)
    : null;

  contracts.commandValidator = new ethers.Contract(
    addresses.command_validator,
    loadAbi('CommandValidator.sol', 'CommandValidator'),
    adminWallet
  );

  contracts.pacemakerMonitor = new ethers.Contract(
    addresses.pacemaker_monitor,
    loadAbi('replay.sol', 'SecurePacemakerMonitor'),
    adminWallet
  );

  contracts.idsLogger = new ethers.Contract(
    addresses.ids_logger,
    loadAbi('PacemakerSecurity.sol', 'PacemakerIDSLogger'),
    adminWallet
  );

  console.log('✅ Connected to deployed contracts:');
  console.log('   UnauthorizedAccessControl:', addresses.access_control);
  console.log('   CommandValidator:         ', addresses.command_validator);
  console.log('   SecurePacemakerMonitor:   ', addresses.pacemaker_monitor);
  console.log('   PacemakerIDSLogger:       ', addresses.ids_logger);
  return true;
}

const contractsReady = initContracts();

function requireContracts(req, res, next) {
  if (!contractsReady) {
    return res.status(503).json({
      error: 'Contracts not deployed/loaded. Run scripts/deployAll.js first, then restart the backend.'
    });
  }
  next();
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    contractsLoaded: contractsReady,
    rpcUrl: RPC_URL,
  });
});

// ---------------------------------------------------------------------------
// IDS Alerts (PacemakerIDSLogger)
// ---------------------------------------------------------------------------

app.get('/api/ids-alerts', requireContracts, async (req, res) => {
  try {
    const count = await contracts.idsLogger.alertCounter();
    const alerts = [];
    for (let i = 1; i <= Number(count); i++) {
      const a = await contracts.idsLogger.getAlert(i);
      alerts.push({
        id: Number(a.id),
        patientId: a.patientId,
        patientDetails: a.patientDetails,
        attackType: a.attackType,
        alteredFrequency: a.alteredFrequency,
        previousFrequency: a.previousFrequency,
        source: a.source,
        ipfsHash: a.ipfsHash,
        severity: a.severity,
        deviceModel: a.deviceModel,
        riskCategory: a.riskCategory,
        timestamp: Number(a.timestamp),
      });
    }
    res.json({ count: alerts.length, alerts: alerts.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ids-alerts — log a new IDS alert (blockchain + IPFS + MySQL mirror)
app.post('/api/ids-alerts', requireContracts, async (req, res) => {
  try {
    const {
      patientId = '', patientDetails = '', attackType = '', alteredFrequency = '',
      previousFrequency = '', source = '', severity = 'Medium',
      deviceModel = '', riskCategory = ''
    } = req.body;

    let ipfsHash = req.body.ipfsHash || '';
    if (!ipfsHash) {
      try {
        ipfsHash = await uploadToIPFS({
          patientId, patientDetails, attackType, alteredFrequency,
          previousFrequency, source, severity, deviceModel, riskCategory,
          loggedAt: new Date().toISOString(),
        });
      } catch (ipfsErr) {
        console.warn('⚠️  IPFS upload failed, continuing without it:', ipfsErr.message);
        ipfsHash = 'IPFS_UPLOAD_FAILED';
      }
    }

    const tx = await contracts.idsLogger.logIDSAlert(
      patientId, patientDetails, attackType, alteredFrequency,
      previousFrequency, source, ipfsHash, severity, deviceModel, riskCategory
    );
    const receipt = await tx.wait();

    // Mirror into MySQL — fire after blockchain success, never blocks the response,
    // never fails the request if MySQL has an issue (chain is still the source of truth)
    await insertIdsAlert({
      patientId, patientDetails, attackType, alteredFrequency, previousFrequency,
      source, ipfsHash, severity, deviceModel, riskCategory,
      txHash: receipt.hash, blockNumber: receipt.blockNumber,
    });

    res.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      ipfsHash,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/ids-alerts/db — fast read straight from the MySQL mirror, instead of
// looping through every alert on-chain. Useful for larger datasets/reporting.
app.get('/api/ids-alerts/db', async (req, res) => {
  try {
    const rows = await getIdsAlertsFromDB();
    res.json({ count: rows.length, alerts: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Approved Commands (PacemakerIDSLogger)
// ---------------------------------------------------------------------------

app.get('/api/approved-commands', requireContracts, async (req, res) => {
  try {
    const count = await contracts.idsLogger.commandCounter();
    const commands = [];
    for (let i = 1; i <= Number(count); i++) {
      const c = await contracts.idsLogger.getApprovedCommand(i);
      commands.push({
        id: Number(c.id),
        patientId: c.patientId,
        command: c.command,
        approvedBy: c.approvedBy,
        timestamp: Number(c.timestamp),
        expiry: Number(c.expiry),
      });
    }
    res.json({ count: commands.length, commands: commands.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/approved-commands', requireContracts, async (req, res) => {
  try {
    const { command = '', patientId = '', approvedBy = 'Admin' } = req.body;
    const tx = await contracts.idsLogger.logApprovedCommand(command, patientId, approvedBy);
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash, blockNumber: receipt.blockNumber });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Command Validator
// ---------------------------------------------------------------------------

app.post('/api/validate-command', requireContracts, async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'command is required' });

    const tx = await contracts.commandValidator.submitCommand(command);
    const receipt = await tx.wait();
    res.json({
      accepted: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });
  } catch (err) {
    const msg = err.shortMessage || err.message || 'Unknown error';
    res.json({ accepted: false, reason: msg });
  }
});

app.get('/api/allowed-commands', requireContracts, async (req, res) => {
  try {
    const commands = await contracts.commandValidator.getAllowedCommands();
    res.json({ commands });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Access Control / RBAC (UnauthorizedAccessControl)
// ---------------------------------------------------------------------------

app.get('/api/access-logs', requireContracts, async (req, res) => {
  try {
    const count = await contracts.accessControl.getLogCount();
    const logs = [];
    for (let i = 0; i < Number(count); i++) {
      const l = await contracts.accessControl.getAccessLog(i);
      logs.push({
        user: l.user,
        purpose: l.purpose,
        roles: l.roles,
        success: l.success,
        reason: l.reason,
        timestamp: Number(l.timestamp),
      });
    }
    res.json({ count: logs.length, logs: logs.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/access-logs — log a normal signal/access attempt (blockchain + MySQL mirror)
app.post('/api/access-logs', requireContracts, async (req, res) => {
  try {
    if (!contracts.accessControlAsDoctor) {
      return res.status(503).json({ error: 'Doctor wallet not configured (DEVICE_DOCTOR_KEY missing in .env)' });
    }
    const { purpose } = req.body;
    if (!purpose) return res.status(400).json({ error: 'purpose is required' });

    const tx = await contracts.accessControlAsDoctor.requestAccess(purpose);
    const receipt = await tx.wait();

    // Mirror into MySQL
    await insertAccessLog({
      userAddress: doctorWallet.address,
      purpose,
      roles: ['doctor'],
      success: true,
      reason: 'Access Granted',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });

    res.json({ success: true, txHash: receipt.hash, blockNumber: receipt.blockNumber });
  } catch (err) {
    res.status(400).json({ success: false, error: err.shortMessage || err.message });
  }
});

// GET /api/access-logs/db — fast read straight from the MySQL mirror
app.get('/api/access-logs/db', async (req, res) => {
  try {
    const rows = await getAccessLogsFromDB();
    res.json({ count: rows.length, logs: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Aggregate stats
// ---------------------------------------------------------------------------
app.get('/api/stats', requireContracts, async (req, res) => {
  try {
    const [alertCount, commandCount, accessLogCount, latestBlock] = await Promise.all([
      contracts.idsLogger.alertCounter(),
      contracts.idsLogger.commandCounter(),
      contracts.accessControl.getLogCount(),
      provider.getBlockNumber(),
    ]);

    res.json({
      totalIdsAlerts: Number(alertCount),
      totalApprovedCommands: Number(commandCount),
      totalAccessLogs: Number(accessLogCount),
      latestBlock,
      contracts: addresses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Doctors
// ---------------------------------------------------------------------------

app.post('/api/doctors', requireContracts, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'address is required' });
    const tx = await contracts.accessControl.addDoctorNew(address);
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash, blockNumber: receipt.blockNumber });
  } catch (err) {
    res.status(400).json({ success: false, error: err.shortMessage || err.message });
  }
});

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

app.post('/api/patients', requireContracts, async (req, res) => {
  try {
    const { patientAddress, name, age, medicalHistory, doctorAddress } = req.body;
    if (!patientAddress || !doctorAddress) {
      return res.status(400).json({ error: 'patientAddress and doctorAddress are required' });
    }
    const tx = await contracts.accessControl.registerPatient(
      patientAddress, name || '', age || 0, medicalHistory || '', doctorAddress
    );
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash, blockNumber: receipt.blockNumber });
  } catch (err) {
    res.status(400).json({ success: false, error: err.shortMessage || err.message });
  }
});

app.get('/api/patients/:address', requireContracts, async (req, res) => {
  try {
    const [name, age, medicalHistory] = await contracts.accessControl.getPatientInfo(req.params.address);
    const checkupHistory = await contracts.accessControl.getPatientHistory(req.params.address);
    res.json({ name, age: Number(age), medicalHistory, checkupHistory });
  } catch (err) {
    res.status(404).json({ error: err.shortMessage || err.message });
  }
});

app.get('/api/doctors/:address/patients', requireContracts, async (req, res) => {
  try {
    const patients = await contracts.accessControl.getDoctorPatients(req.params.address);
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Firmware Updates
// ---------------------------------------------------------------------------

app.get('/api/firmware-updates', requireContracts, async (req, res) => {
  try {
    const count = await contracts.accessControl.getFirmwareUpdateCount();
    const updates = [];
    for (let i = 0; i < Number(count); i++) {
      const [deviceId, firmwareVersion, firmwareHash, updatedBy, timestamp] =
        await contracts.accessControl.getFirmwareUpdate(i);
      updates.push({
        deviceId, firmwareVersion, firmwareHash, updatedBy, timestamp: Number(timestamp)
      });
    }
    res.json({ count: updates.length, updates: updates.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/firmware-updates', requireContracts, async (req, res) => {
  try {
    if (!contracts.accessControlAsTech) {
      return res.status(503).json({ error: 'Technician wallet not configured (DEVICE_TECH_KEY missing in .env)' });
    }
    const { deviceId, firmwareVersion, firmwareHash } = req.body;
    if (!deviceId || !firmwareVersion || !firmwareHash) {
      return res.status(400).json({ error: 'deviceId, firmwareVersion, and firmwareHash are required' });
    }
    const tx = await contracts.accessControlAsTech.updateFirmware(deviceId, firmwareVersion, firmwareHash);
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash, blockNumber: receipt.blockNumber });
  } catch (err) {
    res.status(400).json({ success: false, error: err.shortMessage || err.message });
  }
});

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

app.get('/api/appointments', requireContracts, async (req, res) => {
  try {
    if (!contracts.accessControlAsDoctor) {
      return res.status(503).json({ error: 'Doctor wallet not configured (DEVICE_DOCTOR_KEY missing in .env)' });
    }
    const appointments = await contracts.accessControlAsDoctor.getMyAppointments();
    res.json({
      appointments: appointments.map(a => ({ date: a.date, reason: a.reason }))
    });
  } catch (err) {
    res.status(500).json({ error: err.shortMessage || err.message });
  }
});

app.post('/api/appointments', requireContracts, async (req, res) => {
  try {
    if (!contracts.accessControlAsDoctor) {
      return res.status(503).json({ error: 'Doctor wallet not configured (DEVICE_DOCTOR_KEY missing in .env)' });
    }
    const { date, reason } = req.body;
    if (!date || !reason) return res.status(400).json({ error: 'date and reason are required' });
    const tx = await contracts.accessControlAsDoctor.addAppointment(date, reason);
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash, blockNumber: receipt.blockNumber });
  } catch (err) {
    res.status(400).json({ success: false, error: err.shortMessage || err.message });
  }
});

// ---------------------------------------------------------------------------
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  if (!contractsReady) {
    console.log('⚠️  Started without contracts loaded — most /api routes will return 503 until you deploy and restart.');
  }
  await testConnection();
});