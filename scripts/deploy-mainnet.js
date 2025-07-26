const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CCOP Dispenser Contract to Celo Mainnet...");

  // CCOP Token Address on Celo Mainnet
  const CCOP_TOKEN_ADDRESS = "0x8A567e2aE79CA692Bd748aB832081C45de4041eA"; // Real cCOP token on Celo mainnet

  // Get the contract factory
  const CCOPDispenser = await hre.ethers.getContractFactory("CCOPDispenser");
  
  // Deploy the contract with CCOP token address
  const ccopDispenser = await CCOPDispenser.deploy(CCOP_TOKEN_ADDRESS);
  
  // Wait for deployment to finish
  await ccopDispenser.waitForDeployment();
  
  const contractAddress = await ccopDispenser.getAddress();
  
  console.log("✅ CCOP Dispenser deployed to mainnet:", contractAddress);
  console.log("📋 Contract Details:");
  console.log("   - CCOP Token Address:", CCOP_TOKEN_ADDRESS);
  console.log("   - Daily Claim Amount: 25,000 CCOP");
  console.log("   - Max Lifetime Claims: 3");
  console.log("   - Reset Time: Midnight UTC");
  
  // Get token info
  try {
    const tokenInfo = await ccopDispenser.getTokenInfo();
    console.log("   - Token Name:", tokenInfo[1]);
    console.log("   - Token Symbol:", tokenInfo[2]);
    console.log("   - Token Decimals:", tokenInfo[3].toString());
  } catch (error) {
    console.log("   - Could not fetch token info:", error.message);
  }
  
  // Verify the contract on CeloScan
  console.log("🔍 Verifying contract on CeloScan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [CCOP_TOKEN_ADDRESS],
    });
    console.log("✅ Contract verified on CeloScan!");
  } catch (error) {
    console.log("❌ Contract verification failed:", error.message);
  }
  
  console.log("\n🎯 Next steps:");
  console.log("1. Transfer CCOP tokens to the contract address:", contractAddress);
  console.log("2. Update environment variables for production");
  console.log("3. Deploy frontend to Vercel with mainnet config");
  console.log("4. Test the claim functionality on mainnet");
  
  console.log("\n💰 To fund the contract:");
  console.log(`   - Transfer CCOP tokens to: ${contractAddress}`);
  console.log(`   - Recommended amount: At least 10,000,000 CCOP for production`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 