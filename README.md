# Pacemaker Blockchain Access Control System

A Zero-Trust cybersecurity framework for implantable pacemakers using blockchain-based access control, real-time IDS, IPFS audit trails, and MySQL persistence.

Accepted at **IEEE CONECCT 2026**.

---

## Architecture

```
Pacemaker Device → Edge IDS (idsEngine.js)
    → Smart Contracts (Solidity, Hardhat)
    → Backend (Node.js + Ethers.js)
    → Blockchain (Hardhat local / Ethereum-compatible)
    → IPFS (Pinata)
    → MySQL (parallel mirror)
    → Frontend Dashboard (React)
```

---

## Prerequisites

- Node.js v18+ (with npm)
- Python 3.8+
- MySQL 8+
- Git

---

## Setup

### 1. Install dependencies

```bash
cd access-control
npm install

cd Backend
npm install

cd ../pacemaker-frontend
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your values in .env
```

### 3. Set up MySQL

```sql
CREATE DATABASE IF NOT EXISTS pacemaker_security;
USE pacemaker_security;

CREATE TABLE ids_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id VARCHAR(100), patient_details TEXT,
  attack_type VARCHAR(255), altered_frequency VARCHAR(50),
  previous_frequency VARCHAR(50), source VARCHAR(255),
  ipfs_hash VARCHAR(255), severity VARCHAR(50),
  device_model VARCHAR(255), risk_category VARCHAR(255),
  tx_hash VARCHAR(255), block_number INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE access_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_address VARCHAR(255), purpose VARCHAR(255),
  roles VARCHAR(255), success BOOLEAN, reason VARCHAR(255),
  tx_hash VARCHAR(255), block_number INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Running the Project

Open 3 terminals:

**Terminal 1 — Start local blockchain:**
```bash
cd access-control
npx hardhat node
```

**Terminal 2 — Deploy contracts + start backend:**
```bash
cd access-control
npx hardhat run scripts/deployAll.js --network localhost
cd Backend
node index.js
```

**Terminal 3 — Start frontend:**
```bash
cd access-control/pacemaker-frontend
npm start
```

Open `http://localhost:3000` in your browser.

---

## Running the Pacemaker Simulator

Generates live pacemaker signals, runs them through the edge IDS, and logs results to blockchain + IPFS + MySQL automatically:

```bash
cd access-control
node scripts/pacemakerSimulator.js
```

Watch the **IDS Alerts** page in the dashboard — alerts appear automatically as threats are detected.

---

## Running Security Tests

```bash
cd access-control
npx hardhat test scripts/ValidCommand.js scripts/RateLimit.js scripts/ReplayAttack.js
```

All 3 tests should pass, verifying:
- Valid signed commands are accepted by the smart contract
- Rate limiting correctly blocks command flooding
- Replay attacks (duplicate nonces) are rejected

---

## Python Demo Module

For a standalone simulation with performance metrics:

```bash
cd pacemaker-demo
pip install -r requirements.txt
python main.py
```

Choose **Simulation Mode (2)** → **Complete Test Suite (7)** → **Show Statistics (8)** for the full results report.

---

## Key Scripts

| Script | Purpose |
|---|---|
| `scripts/deployAll.js` | Deploys all 4 contracts, registers devices/roles |
| `scripts/pacemakerSimulator.js` | Live automated signal generator → IDS → blockchain |
| `scripts/idsEngine.js` | Edge-layer IDS logic (frequency + sender checks) |
| `scripts/testIdsLayer.js` | Isolated IDS unit tests (no blockchain needed) |
| `scripts/ValidCommand.js` | Smart contract signing/validation test |
| `scripts/RateLimit.js` | Rate limiting enforcement test |
| `scripts/ReplayAttack.js` | Replay attack prevention test |

---

## Smart Contracts

| Contract | Purpose |
|---|---|
| `UnauthorizedAccessControl.sol` | RBAC, doctor/patient registration, firmware, appointments |
| `CommandValidator.sol` | Command allowlist + malicious pattern detection |
| `SecurePacemakerMonitor.sol` (replay.sol) | Signed commands + replay/rate-limit protection |
| `PacemakerIDSLogger.sol` (PacemakerSecurity.sol) | Immutable IDS alert logging + IPFS CID storage |

---

## API Endpoints (Backend — port 5000)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats` | Aggregate counts from blockchain |
| GET/POST | `/api/ids-alerts` | IDS alerts (blockchain + IPFS + MySQL) |
| GET | `/api/ids-alerts/db` | Fast read from MySQL mirror |
| GET/POST | `/api/access-logs` | Access/telemetry logs |
| GET/POST | `/api/firmware-updates` | Firmware update history |
| GET/POST | `/api/appointments` | Appointment scheduling |
| POST | `/api/doctors` | Register doctor on-chain |
| POST | `/api/patients` | Register patient on-chain |
| GET | `/api/patients/:address` | Fetch patient record |
| POST | `/api/validate-command` | Test command through IDS contract |
| GET | `/api/allowed-commands` | List of allowed commands from contract |
