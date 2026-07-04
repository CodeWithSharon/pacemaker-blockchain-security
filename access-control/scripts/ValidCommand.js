const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecurePacemakerMonitor", function () {
  let contract;
  let admin, device;

  beforeEach(async function () {
    [admin, device] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory("SecurePacemakerMonitor");
    contract = await ContractFactory.connect(admin).deploy();
    await contract.waitForDeployment();
  });

  it("should register a device and process a valid command", async function () {
    await contract.connect(admin).registerDevice(device.address, device.address);

    // A freshly-deployed contract requires block.number > lastCommandBlock(0) + 4
    // before it will accept the very first command. Mine a few blocks to satisfy
    // this so the test reflects normal post-deployment behavior, not a cold-start edge case.
    for (let i = 0; i < 5; i++) {
      await ethers.provider.send("evm_mine");
    }

    const nonce = 1;
    const timestamp = Math.floor(Date.now() / 1000);
    const command = ethers.encodeBytes32String("SHOCK");
    const contractAddress = await contract.getAddress();
    const { chainId } = await ethers.provider.getNetwork();

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "bytes32", "uint256", "uint256", "uint256", "address"],
      [device.address, command, nonce, timestamp, chainId, contractAddress]
    );

    const signature = await device.signMessage(ethers.getBytes(messageHash));

    const tx = await contract.connect(device).sendCommand(nonce, command, timestamp, signature);
    await expect(tx).to.emit(contract, "CommandProcessed");
  });
});