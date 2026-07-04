require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28", // Match this to your contract's pragma if you want to use 0.8.28
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // You can adjust this value
      },
      viaIR: true
    },
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "0xfe029b9b9c554d41dbafdb2db93ec44f3c0c160885f4e6458dc284163fd7fd3d",
        "0xd36ab1f2a60ad551582f600b69f39057d3a311574e4bc5245ebca439a56f864a",
        "0x489d13d3a5051c7af5717efcfdfe47b6d737925514f4a0e8e32b8ea7a7dfee23",
        "0xa9b5e7a2d35cd414d66a41aba8a8a471f0a855daab0edf60acc280f7cdfb2ae6"
      ]
    }
  }
};