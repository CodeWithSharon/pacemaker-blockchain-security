# Pacemaker Blockchain Access Control - Demonstration Application

## Overview

This Python application demonstrates how blockchain technology protects pacemakers from unauthorized access and malicious attacks. It provides **TWO MODES**:

1. **🔗 BLOCKCHAIN MODE** - Connects to your actual Hardhat blockchain and deployed smart contracts
2. **💻 SIMULATION MODE** - Runs a local Python simulation of blockchain security

## Features

### 🔒 Security Mechanisms Demonstrated

1. **Authorization Control**: Verifies that signals come from authorized medical devices/personnel
2. **Command Validation**: Ensures commands are in the allowed list and contain no malicious patterns
3. **Replay Attack Prevention**: Uses nonce-based validation to prevent replayed commands
4. **Rate Limiting**: Prevents DoS-like attacks by limiting command frequency (cooldown period)
5. **Malicious Pattern Detection**: Blocks commands with dangerous patterns (`;`, `|`, `rm`, etc.)
6. **Blockchain Integrity**: Maintains an immutable log of all transactions

## Architecture

### Components

```
pacemaker-demo/
│
├── main.py                          # Main application with mode selection
├── blockchain_connector.py          # Web3 connection to Hardhat blockchain
├── blockchain_demo_scenarios.py     # Real blockchain demonstration scenarios
├── blockchain_wall.py               # Simulated blockchain security layer
├── signal_simulator.py              # Signal generation for testing
├── demo_scenarios.py                # Simulated demonstration scenarios
├── utils.py                         # Helper functions for display
├── requirements.txt                 # Python dependencies
├── setup.bat                        # Windows setup script
└── README.md                        # This file
```

### How It Works - Blockchain Mode

```
┌─────────────────┐
│  Python Demo    │
│  Application    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Web3.py       │ (connects via HTTP)
│   Library       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Hardhat Blockchain (Local Node)   │
│   http://127.0.0.1:8545             │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│    Smart Contracts (Deployed)        │
│                                      │
│  • CommandValidator.sol              │
│    - submitCommand()                 │
│    - Rate limiting (cooldown)        │
│    - Command validation              │
│    - Replay protection (nonce)       │
│                                      │
│  • UnauthorizedAccessControl.sol     │
│    - checkAccess()                   │
│    - Role management                 │
│    - Emergency mode                  │
└──────────────────────────────────────┘
         │
         ▼
    ┌──────────┐
    │ Accept ✅ │ → Transaction mined, event emitted
    └──────────┘
         OR
    ┌──────────┐
    │ Reject ❌ │ → Transaction reverts with reason
    └──────────┘
```

## Installation

### Prerequisites

- **Python 3.7+** (Python 3.9+ recommended)
- **pip** (Python package manager)
- **Hardhat Node** (for Blockchain Mode only)
- **Deployed Smart Contracts** (for Blockchain Mode only)

### Quick Setup (Windows)

1. **Navigate to the demo directory:**
   ```bash
   cd pacemaker-demo
   ```

2. **Run the setup script:**
   ```bash
   setup.bat
   ```

   This will:
   - Check Python installation
   - Install required dependencies
   - Check if Hardhat node is running

### Manual Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **For Blockchain Mode, start Hardhat node:**
   
   Open a **separate terminal**:
   ```bash
   cd ../access-control
   npx hardhat node
   ```
   
   Keep this terminal running while using Blockchain Mode.

3. **Ensure contracts are deployed:**
   
   In another terminal (if not already deployed):
   ```bash
   cd ../access-control
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Running the Application

```bash
python main.py
```

You'll be prompted to select a mode:
- **Option 1**: Blockchain Mode (requires Hardhat node running)
- **Option 2**: Simulation Mode (works standalone)

## Usage

### Main Menu Options

1. **🔒 Demonstrate Authorized Access**
   - **Blockchain Mode**: Sends real transaction to CommandValidator contract
   - **Simulation Mode**: Simulates blockchain validation locally

2. **❌ Demonstrate Unauthorized Access Attempt**
   - **Blockchain Mode**: Creates unauthorized account, transaction fails
   - **Simulation Mode**: Shows simulated authorization check

3. **🎯 Demonstrate Malicious Command Injection**
   - **Blockchain Mode**: Smart contract rejects malicious patterns
   - **Simulation Mode**: Simulates pattern detection

4. **🔁 Demonstrate Replay Attack Prevention**
   - **Blockchain Mode**: Blockchain nonce prevents transaction replay
   - **Simulation Mode**: Simulates nonce validation

5. **⚡ Demonstrate Rate Limiting**
   - **Blockchain Mode**: Smart contract enforces cooldown period
   - **Simulation Mode**: Simulates rate limiting logic

6. **📊 Demonstrate Command Validation** (Blockchain Mode)
   - Smart contract checks if command is in allowed list

7. **🛡️ Run Complete Security Test Suite**
   - Runs all demonstrations in sequence

8. **📈 View System Statistics**
   - **Blockchain Mode**: Shows real blockchain stats, gas usage, account balances
   - **Simulation Mode**: Shows simulation statistics

9. **🔄 Reset Demo Environment**
   - Resets local counters (blockchain state persists)

0. **🚪 Exit**

## Demo Scenarios Explained

### Blockchain Mode Scenarios

#### Scenario 1: Authorized Access
- **Process**: Doctor account sends "status" command via Web3
- **Smart Contract**: CommandValidator.submitCommand()
- **Expected**: ✅ Transaction confirmed, CommandAccepted event emitted
- **Real Output**: Transaction hash, block number, gas used

#### Scenario 2: Unauthorized Access
- **Process**: Creates new unauthorized account, attempts transaction
- **Expected**: ❌ Fails due to insufficient funds (no ETH for gas)
- **Demonstrates**: Only authorized accounts with gas can interact

#### Scenario 3: Malicious Command Injection
- **Process**: Authorized account tries "rm -rf" or other dangerous commands
- **Smart Contract**: Checks blocked patterns in CommandValidator
- **Expected**: ❌ Transaction reverts with "Malicious pattern detected"

#### Scenario 4: Replay Attack
- **Process**: Send transaction, then try to replay same raw transaction
- **Expected**: ❌ Blockchain rejects with "nonce too low" or "already known"
- **Demonstrates**: Ethereum's built-in replay protection

#### Scenario 5: Rate Limiting
- **Process**: Send multiple rapid commands
- **Smart Contract**: Checks `lastCommandTime + cooldown`
- **Expected**: ❌ After first command, others fail with "Cooldown period active"

#### Scenario 6: Command Validation
- **Process**: Send commands not in allowed list (e.g., "restart", "shutdown")
- **Smart Contract**: Checks against `allowedCommands` array
- **Expected**: ❌ Transaction reverts with "Command not allowed"

### Simulation Mode Scenarios

Similar to blockchain mode but executed locally without actual transactions. Faster for demonstrations but less realistic.

## Technical Details

### Blockchain Mode Implementation

**Dependencies:**
- `web3>=6.0.0` - Ethereum Python library
- `python-dotenv>=1.0.0` - Environment variable management

**Key Files:**
- `blockchain_connector.py` - Manages Web3 connection, account loading, transaction sending
- `blockchain_demo_scenarios.py` - Scenarios that interact with real contracts

**Transaction Flow:**
1. Build transaction with `contract.functions.submitCommand(command).build_transaction()`
2. Sign with account private key
3. Send via `w3.eth.send_raw_transaction()`
4. Wait for receipt with `w3.eth.wait_for_transaction_receipt()`
5. Parse events and display results

**Environment Variables (from `../access-control/.env`):**
- `RPC_URL` - Hardhat node URL
- `ADMIN_ADDRESS`, `ADMIN_PRIVATE_KEY` - Admin account
- `DEVICE_DOCTOR_ADDRESS`, `DEVICE_DOCTOR_KEY` - Doctor account
- `DEVICE_TECH_ADDRESS`, `DEVICE_TECH_KEY` - Technician account
- `DEVICE_EMERGENCY_ADDRESS`, `DEVICE_EMERGENCY_KEY` - Emergency account

### Smart Contract Integration

**CommandValidator Contract:**
- `submitCommand(string command)` - Main function for command submission
- `cooldown` - Time (seconds) between commands from same address
- `lastCommandTime` - Mapping of address to last command timestamp
- `usedCommandHashes` - Mapping to prevent replay within contract
- `nonces` - Mapping for per-address nonce tracking
- `allowedCommands` - Array of whitelisted commands
- `blockedPatterns` - Array of dangerous patterns

**Events Emitted:**
- `CommandAccepted(address sender, string command, uint timestamp)`
- `CommandRejected(address sender, string reason, uint timestamp)`

## Comparison: Blockchain vs Simulation Mode

| Feature | Blockchain Mode | Simulation Mode |
|---------|----------------|-----------------|
| **Realism** | ✅ Real transactions | ⚠️ Simulated |
| **Speed** | ⚠️ Slower (mining) | ✅ Instant |
| **Gas Costs** | ✅ Shows actual gas | ❌ No gas tracking |
| **Setup** | ⚠️ Requires Hardhat | ✅ Standalone |
| **Persistence** | ✅ On blockchain | ❌ In memory only |
| **Events** | ✅ Real Solidity events | ⚠️ Simulated |
| **Use Case** | Research, Testing | Education, Quick demos |

## Troubleshooting

### "Failed to connect to blockchain"

**Solutions:**
1. Start Hardhat node:
   ```bash
   cd ../access-control
   npx hardhat node
   ```
2. Check `.env` file has correct `RPC_URL=http://127.0.0.1:8545`
3. Verify contracts are deployed
4. Use Simulation Mode as fallback

### "Transaction reverted" or "execution reverted"

This is **expected behavior** for security demonstrations! The smart contract is correctly rejecting invalid commands.

### "Insufficient funds for gas"

In Hardhat, accounts should have pre-funded ETH. If not:
1. Restart Hardhat node
2. Redeploy contracts
3. Check account addresses match `.env`

### "Module not found: web3"

```bash
pip install -r requirements.txt
```

### Colors not displaying properly on Windows

```bash
pip install colorama
```

## Future Enhancements

Potential additions:

- [ ] Web-based GUI (Flask/Streamlit)
- [ ] Real-time event listener for blockchain events
- [ ] Integration with PacemakerIDSLogger contract
- [ ] Grafana dashboard for metrics
- [ ] Multi-patient simulation
- [ ] Testnet deployment (Sepolia, Goerli)
- [ ] MetaMask integration
- [ ] Export transaction history to CSV/JSON

## Educational Value

### For Blockchain Mode:
- See **real gas costs** of security validations
- Understand **transaction lifecycle** (build, sign, send, confirm)
- Experience **smart contract reverts** firsthand
- Learn **event-driven architecture** with Solidity events
- Observe **blockchain state** changes over time

### For Simulation Mode:
- Quick **proof of concept** demonstrations
- Explain **security logic** without blockchain complexity
- **Faster iterations** during development
- **Offline demonstrations** without infrastructure

## Integration with Research Paper

This demonstration tool supports your research by:

1. **Visual Proof**: Shows blockchain security in action
2. **Performance Metrics**: Measures gas costs, transaction times
3. **Attack Scenarios**: Demonstrates various attack vectors and defenses
4. **Reproducibility**: Anyone can run the same tests
5. **Educational**: Helps explain complex concepts to reviewers

## License

Part of research project on blockchain security for medical devices.

## Contact

For questions about blockchain integration:
- Review smart contract code in `/access-control/contracts/`
- Check Hardhat configuration in `/access-control/hardhat.config.js`
- Examine deployed addresses in `/access-control/*.txt` files

---

**⚠️ Important Notes:**

- **Blockchain Mode** requires active Hardhat node and deployed contracts
- **Simulation Mode** works completely offline
- Both modes demonstrate the same security principles
- Use **Blockchain Mode** for research/testing, **Simulation Mode** for quick demos
- All accounts use test private keys - **NEVER use these in production**
