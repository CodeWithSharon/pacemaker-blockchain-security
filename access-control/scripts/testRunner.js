const ganache = require("ganache");
const { exec } = require("child_process");
const chalk = require("chalk");

const tests = [
  { name: "✅ Valid Command", file: "test/ValidCommand.js" },
  { name: "❌ Replay Attack", file: "test/ReplayAttack.js" },
  { name: "❌ Rate Limit Bypass", file: "test/RateLimit.js" },
  { name: "❌ Invalid Signature", file: "test/InvalidSignature.js" },
  { name: "❌ Expired Command", file: "test/ExpiredCommand.js" },
];

const runTest = ({ name, file }) => {
  return new Promise((resolve) => {
    const start = Date.now();
    exec(`npx hardhat test ${file} --network ganache`, (error, stdout, stderr) => {
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      const passed = !error;

      console.log(chalk.blue.bold(`\n🧪 Running: ${name}`));
      if (passed) {
        console.log(chalk.green("✔️  Passed"));
      } else {
        console.log(chalk.red("❌ Failed"));
        console.log(chalk.gray("↪ Output:"));
        console.log(chalk.yellow(stdout || stderr));
      }

      console.log(chalk.gray(`⏱️  Duration: ${duration}s\n`));
      resolve();
    });
  });
};

const runAllTests = async () => {
  console.log(chalk.bold("\n🔐 Starting Ganache for SecurePacemakerMonitor Demo..."));

  // 1. Spin up Ganache in memory
  const ganacheServer = ganache.server({
    logging: { quiet: true },
    wallet: { totalAccounts: 10, defaultBalance: 100 },
    chain: { chainId: 1337 }
  });

  await ganacheServer.listen(8545);
  console.log(chalk.green("🚀 Ganache running at http://localhost:8545\n"));

  // 2. Run tests
  for (const test of tests) {
    await runTest(test);
  }

  // 3. Shutdown Ganache
  console.log(chalk.bold("\n🧹 Shutting down Ganache..."));
  await ganacheServer.close();
  console.log(chalk.green("✅ Ganache stopped. All done!\n"));
};

runAllTests();
