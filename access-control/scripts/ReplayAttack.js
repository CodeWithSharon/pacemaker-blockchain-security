const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🔁 Replay Attack Test", function () {
  it("should reject duplicate commands with same nonce", async function () {
    const [admin, device] = await ethers.getSigners();

    const Pacemaker = await ethers.getContractFactory("SecurePacemakerMonitor");
    const contract = await Pacemaker.deploy();
    await contract.waitForDeployment();

    await contract.connect(admin).registerDevice(device.address, device.address);

    // Mine 5 blocks to clear cold-start rate limit
    for (let i = 0; i < 5; i++) {
      await ethers.provider.send("evm_mine");
    }

    const command = ethers.encodeBytes32String("SHOCK");
    const nonce = 1;
    const timestamp = Math.floor(Date.now() / 1000);
    const contractAddress = await contract.getAddress();
    const { chainId } = await ethers.provider.getNetwork();

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "bytes32", "uint256", "uint256", "uint256", "address"],
      [device.address, command, nonce, timestamp, chainId, contractAddress]
    );

    const signature = await device.signMessage(ethers.getBytes(messageHash));

    // First command — should succeed
    await contract.connect(device).sendCommand(nonce, command, timestamp, signature);
    console.log("  ✅ First command accepted");

    // Replay — same nonce, should be rejected
    await expect(
      contract.connect(device).sendCommand(nonce, command, timestamp, signature)
    ).to.be.revertedWith("Replay or out-of-order nonce");
    console.log("  ✅ Replay correctly rejected");
  });
});