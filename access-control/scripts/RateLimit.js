const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("⏱️ Rate Limit Bypass Test", function () {
  it("should reject a second command if rate limit not satisfied", async function () {
    const [admin, device] = await ethers.getSigners();

    const Pacemaker = await ethers.getContractFactory("SecurePacemakerMonitor");
    const contract = await Pacemaker.deploy();
    await contract.waitForDeployment();

    await contract.connect(admin).registerDevice(device.address, device.address);

    const command = ethers.encodeBytes32String("SHOCK");
    const contractAddress = await contract.getAddress();
    const { chainId } = await ethers.provider.getNetwork();

    async function buildSignedCommand(nonce) {
      const timestamp = Math.floor(Date.now() / 1000);
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "bytes32", "uint256", "uint256", "uint256", "address"],
        [device.address, command, nonce, timestamp, chainId, contractAddress]
      );
      const signature = await device.signMessage(ethers.getBytes(messageHash));
      return { nonce, timestamp, signature };
    }

    // Mine 5 blocks BEFORE first command to clear cold-start rate limit
    for (let i = 0; i < 5; i++) {
      await ethers.provider.send("evm_mine");
    }

    // First command — should succeed
    const cmd1 = await buildSignedCommand(1);
    await contract.connect(device).sendCommand(cmd1.nonce, command, cmd1.timestamp, cmd1.signature);
    console.log("  ✅ First command accepted");

    // Second command immediately — should be rate limited
    const cmd2 = await buildSignedCommand(2);
    await expect(
      contract.connect(device).sendCommand(cmd2.nonce, command, cmd2.timestamp, cmd2.signature)
    ).to.be.revertedWith("Rate limit exceeded");
    console.log("  ✅ Rate limit correctly triggered");

    // Mine 5 more blocks to clear rate limit
    for (let i = 0; i < 5; i++) {
      await ethers.provider.send("evm_mine");
    }

    // Third command — should succeed now
    const cmd3 = await buildSignedCommand(2);
    await expect(
      contract.connect(device).sendCommand(cmd3.nonce, command, cmd3.timestamp, cmd3.signature)
    ).to.emit(contract, "CommandProcessed");
    console.log("  ✅ Command accepted after rate limit cleared");
  });
});