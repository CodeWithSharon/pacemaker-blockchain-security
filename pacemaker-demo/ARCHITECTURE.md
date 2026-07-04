# System Architecture Diagram

## Blockchain Mode - Full System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PACEMAKER DEMO APPLICATION                       │
│                              (Python + Web3)                             │
│                                                                          │
│  ┌────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │   main.py      │───▶│ blockchain_      │───▶│  blockchain_     │   │
│  │                │    │ connector.py     │    │  demo_scenarios  │   │
│  │  Mode Select   │    │                  │    │                  │   │
│  │  Menu System   │    │  Web3 Connection │    │  Test Scenarios  │   │
│  └────────────────┘    └──────────────────┘    └──────────────────┘   │
│                                  │                                      │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
                                   │ HTTP/JSON-RPC
                                   │ (Web3.py)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    HARDHAT LOCAL BLOCKCHAIN NODE                         │
│                      http://127.0.0.1:8545                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Account 1: Admin         - 0xf39Fd6e51aad88F6F4ce6aB8827...   │    │
│  │  Account 2: Doctor        - 0x70997970C51812dc3A010C7d01b...   │    │
│  │  Account 3: Technician    - 0x3C44CdDdB6a900fa2b585dd299e...   │    │
│  │  Account 4: Emergency     - 0x90F79bf6EB2c4f870365E785982...   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                     DEPLOYED SMART CONTRACTS                    │    │
│  │                                                                 │    │
│  │  ╔═══════════════════════════════════════════════════════╗     │    │
│  │  ║         CommandValidator Contract                     ║     │    │
│  │  ║  Address: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 ║     │    │
│  │  ╚═══════════════════════════════════════════════════════╝     │    │
│  │  │                                                             │    │
│  │  ├─▶ submitCommand(string command)                            │    │
│  │  │   ┌─────────────────────────────────────────┐              │    │
│  │  │   │ 1. Check if system is paused            │              │    │
│  │  │   │ 2. Check if sender is blacklisted       │              │    │
│  │  │   │ 3. Check cooldown period                │              │    │
│  │  │   │ 4. Check for malicious patterns         │              │    │
│  │  │   │ 5. Check if command is allowed          │              │    │
│  │  │   │ 6. Verify command hash (nonce)          │              │    │
│  │  │   │ 7. Update state & emit event            │              │    │
│  │  │   └─────────────────────────────────────────┘              │    │
│  │  │                                                             │    │
│  │  ├─▶ Events:                                                  │    │
│  │  │   • CommandAccepted(address, string, timestamp)            │    │
│  │  │   • CommandRejected(address, string, timestamp)            │    │
│  │  │                                                             │    │
│  │  ├─▶ State Variables:                                         │    │
│  │  │   • cooldown: 10 seconds                                   │    │
│  │  │   • lastCommandTime[address]                               │    │
│  │  │   • usedCommandHashes[bytes32]                             │    │
│  │  │   • nonces[address]                                        │    │
│  │  │   • allowedCommands[] = ["start", "stop", ...]            │    │
│  │  │   • blockedPatterns[] = [";", "|", "rm", ...]             │    │
│  │  │                                                             │    │
│  │  ╔═══════════════════════════════════════════════════════╗     │    │
│  │  ║    UnauthorizedAccessControl Contract                 ║     │    │
│  │  ║  Address: 0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf ║     │    │
│  │  ╚═══════════════════════════════════════════════════════╝     │    │
│  │  │                                                             │    │
│  │  ├─▶ checkAccess(address, roles[], purpose)                   │    │
│  │  ├─▶ registerDevice(address, roles[])                         │    │
│  │  ├─▶ emergencyMode toggle                                     │    │
│  │  └─▶ Access logging and event emission                        │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Blockchain Features:                                                   │
│  ✓ Immutable transaction log                                            │
│  ✓ Event emission for monitoring                                        │
│  ✓ Gas metering for DoS prevention                                      │
│  ✓ Built-in nonce replay protection                                     │
│  ✓ Cryptographic transaction signing                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Transaction Flow - Blockchain Mode

```
┌──────────────┐
│ User selects │  "1. Demonstrate Authorized Access"
│ menu option  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ blockchain_demo_scenarios.py     │
│ demo_authorized_access()         │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ blockchain_connector.py          │
│ submit_command('doctor', 'status')│
└──────┬───────────────────────────┘
       │
       │ 1. Get doctor account & private key from .env
       │ 2. Get contract instance (CommandValidator)
       │ 3. Build transaction:
       │    {
       │      from: doctor_address,
       │      to: contract_address,
       │      data: submitCommand("status"),
       │      nonce: current_nonce,
       │      gas: 500000,
       │      gasPrice: current_price
       │    }
       │
       ▼
┌──────────────────────────────────┐
│ Sign transaction with private key│
│ (ECDSA signature)                │
└──────┬───────────────────────────┘
       │
       │ Signed Transaction (rawTransaction)
       │
       ▼
┌──────────────────────────────────┐
│ Send to Hardhat node via HTTP    │
│ w3.eth.send_raw_transaction()    │
└──────┬───────────────────────────┘
       │
       │ Transaction Hash returned
       │
       ▼
┌──────────────────────────────────┐
│ Hardhat Node                     │
│ • Validates transaction          │
│ • Executes EVM bytecode          │
│ • Runs submitCommand() logic     │
│ • Checks all security conditions │
└──────┬───────────────────────────┘
       │
       ├─────▶ ✅ SUCCESS                ├─────▶ ❌ REVERT
       │       • State updated           │       • State unchanged
       │       • Event emitted            │       • Revert reason returned
       │       • Gas charged              │       • Gas charged
       │       • Block mined              │       • No event emitted
       │                                  │
       ▼                                  ▼
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│ Transaction Receipt              │    │ Error Message                    │
│ {                                │    │ "execution reverted: Cooldown   │
│   status: 1,                     │    │  period active"                  │
│   blockNumber: 123,              │    │                                  │
│   gasUsed: 85432,                │    └──────────────────────────────────┘
│   transactionHash: "0xabc...",   │
│   events: [                      │
│     {                            │
│       type: "CommandAccepted",   │
│       data: {...}                │
│     }                            │
│   ]                              │
│ }                                │
└──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Display Results to User          │
│ • Transaction hash               │
│ • Block number                   │
│ • Gas used                       │
│ • Events emitted                 │
│ • Success/failure message        │
└──────────────────────────────────┘
```

## Security Check Flow Inside Smart Contract

```
submitCommand("status") called by 0x70997... (Doctor)
│
├─▶ [Check 1] System Paused?
│   require(!paused, "System is paused")
│   ✅ PASS: System is active
│
├─▶ [Check 2] Sender Blacklisted?
│   require(!blacklisted[msg.sender], "Sender is blacklisted")
│   ✅ PASS: Doctor is not blacklisted
│
├─▶ [Check 3] Cooldown Period
│   require(block.timestamp >= lastCommandTime[sender] + cooldown)
│   Current time: 1738425600
│   Last command: 1738425590
│   Cooldown: 10 seconds
│   1738425600 >= 1738425590 + 10
│   ✅ PASS: Cooldown period satisfied
│
├─▶ [Check 4] Malicious Pattern Detection
│   isMalicious("status")
│   Check against: [";", "|", "&", "rm", "exec", ...]
│   ✅ PASS: No malicious patterns found
│
├─▶ [Check 5] Command in Allowed List
│   isAllowed("status")
│   allowedCommands = ["start", "stop", "status", "pulse-check", ...]
│   ✅ PASS: "status" is allowed
│
├─▶ [Check 6] Replay Attack Prevention
│   commandHash = keccak256(command, sender, nonce)
│   require(!usedCommandHashes[commandHash])
│   Hash: 0x1a2b3c4d...
│   ✅ PASS: Hash not used before
│
└─▶ [Update State]
    • usedCommandHashes[0x1a2b3c4d...] = true
    • nonces[0x70997...] = nonces[0x70997...] + 1
    • lastCommandTime[0x70997...] = block.timestamp
    
    [Emit Event]
    emit CommandAccepted(0x70997..., "status", 1738425600)
    
    ✅ TRANSACTION SUCCESS
```

## Comparison: Blockchain vs Simulation Mode

```
┌────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN MODE                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Python App ──HTTP──▶ Hardhat Node ──▶ Smart Contract ──▶ EVM │
│                                                                 │
│  • Real transactions                                           │
│  • Actual gas costs                                            │
│  • Persistent blockchain state                                 │
│  • Event emission                                              │
│  • ~1-2 seconds per transaction                                │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    SIMULATION MODE                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Python App ──▶ Python Blockchain Simulation (blockchain_wall.py) │
│                                                                 │
│  • Simulated blockchain                                        │
│  • No gas tracking                                             │
│  • In-memory state only                                        │
│  • Instant execution                                           │
│  • ~0.1 seconds per operation                                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## File Structure

```
pacemaker-demo/
│
├── main.py                          # Entry point, mode selection
│   └─▶ Imports both blockchain and simulation modules
│
├── BLOCKCHAIN MODE FILES:
│   ├── blockchain_connector.py      # Web3 connection manager
│   │   ├─▶ Loads .env variables
│   │   ├─▶ Connects to Hardhat via Web3.HTTPProvider
│   │   ├─▶ Loads contract ABIs from JSON artifacts
│   │   ├─▶ Creates contract instances
│   │   └─▶ Handles transaction signing & sending
│   │
│   └── blockchain_demo_scenarios.py  # Real blockchain demos
│       ├─▶ Uses blockchain_connector
│       └─▶ Sends actual transactions
│
├── SIMULATION MODE FILES:
│   ├── blockchain_wall.py            # Simulated blockchain
│   │   ├─▶ Block class (mimics Ethereum blocks)
│   │   ├─▶ BlockchainWall class (mimics smart contracts)
│   │   └─▶ All security checks in Python
│   │
│   ├── signal_simulator.py           # Test signal generator
│   │   └─▶ Creates various signal types for testing
│   │
│   └── demo_scenarios.py             # Simulated demos
│       ├─▶ Uses blockchain_wall
│       └─▶ Instant local execution
│
├── SHARED FILES:
│   └── utils.py                      # Display helpers
│       ├─▶ Colored output functions
│       ├─▶ Block detail formatter
│       └─▶ Transaction detail formatter
│
├── CONFIGURATION:
│   ├── requirements.txt              # Python dependencies
│   ├── setup.bat                     # Windows setup script
│   ├── README.md                     # Full documentation
│   ├── QUICKSTART.md                 # Quick start guide
│   └── ARCHITECTURE.md               # This file
│
└── DEPENDENCIES (from ../access-control/):
    ├── .env                          # Account credentials, RPC URL
    ├── contract-address.txt          # CommandValidator address
    ├── deployedAddress.txt           # AccessControl address
    └── artifacts/contracts/          # Contract ABIs (JSON)
```
