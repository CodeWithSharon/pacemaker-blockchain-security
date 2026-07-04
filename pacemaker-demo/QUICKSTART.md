# 🚀 Quick Start Guide

## Option 1: Blockchain Mode (Recommended for Research)

### Step 1: Start Hardhat Node
Open a **new terminal** and run:
```bash
cd access-control
npx hardhat node
```
**Keep this terminal running!**

### Step 2: Deploy Contracts (if not already deployed)
Open **another terminal** and run:
```bash
cd access-control
npx hardhat run scripts/deploy.js --network localhost
```

### Step 3: Install Python Dependencies
```bash
cd pacemaker-demo
pip install -r requirements.txt
```

### Step 4: Run the Demo
```bash
python main.py
```

Select **Option 1** (Blockchain Mode) when prompted.

---

## Option 2: Simulation Mode (Quick Demo)

### Step 1: Install Python Dependencies (optional)
```bash
cd pacemaker-demo
pip install -r requirements.txt
```

### Step 2: Run the Demo
```bash
python main.py
```

Select **Option 2** (Simulation Mode) when prompted.

**No blockchain required!** This runs entirely in Python.

---

## What to Expect

### Blockchain Mode
- ✅ Real transactions on Hardhat blockchain
- ✅ Actual gas costs displayed
- ✅ Smart contract events emitted
- ✅ Transaction hashes and block numbers
- ⏱️ Slower (mining time ~1-2 seconds per transaction)

### Simulation Mode
- ✅ Instant results
- ✅ Same security logic
- ✅ No blockchain setup needed
- ✅ Perfect for quick demos
- ⚡ Much faster

---

## Troubleshooting

### "Failed to connect to blockchain"
1. Make sure Hardhat node is running (`npx hardhat node`)
2. Check that contracts are deployed
3. Verify `.env` file in `access-control/` directory
4. **Fallback**: Use Simulation Mode (Option 2)

### "Module not found: web3"
```bash
pip install web3 python-dotenv
```

### "Transaction reverted"
**This is normal!** It means the security check is working correctly.
The smart contract is supposed to reject malicious/invalid commands.

---

## Quick Demo Flow

1. Run `python main.py`
2. Select mode (1 or 2)
3. Choose **Option 7** from menu: "Run Complete Security Test Suite"
4. Watch all 6 security scenarios execute automatically
5. Review statistics at the end

**Total time**: 
- Blockchain Mode: ~5-10 minutes
- Simulation Mode: ~2-3 minutes

---

## Key Differences

| Feature | Blockchain Mode | Simulation Mode |
|---------|----------------|-----------------|
| Setup | Requires Hardhat | None |
| Speed | ~2s per tx | Instant |
| Realism | 100% Real | Simulated |
| Use Case | Research/Testing | Education/Demos |

---

## Need Help?

Check the full [README.md](README.md) for detailed documentation.
