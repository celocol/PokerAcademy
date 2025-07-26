const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CCOP Dispenser Contract...");

  // CCOP Token Address on Celo Testnet (Alfajores)
  const CCOP_TOKEN_ADDRESS = "0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4";

  // Get the contract factory
  const CCOPDispenser = await hre.ethers.getContractFactory("CCOPDispenser");
  
  // Deploy the contract with CCOP token address
  const ccopDispenser = await CCOPDispenser.deploy(CCOP_TOKEN_ADDRESS);
  
  // Wait for deployment to finish
  await ccopDispenser.waitForDeployment();
  
  const contractAddress = await ccopDispenser.getAddress();
  
  console.log("✅ CCOP Dispenser deployed to:", contractAddress);
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
  if (hre.network.name !== "hardhat") {
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
  }
  
  console.log("\n🎯 Next steps:");
  console.log("1. Transfer CCOP tokens to the contract address:", contractAddress);
  console.log("2. Update the contract address in your frontend");
  console.log("3. Test the claim functionality");
  console.log("4. Share the contract address with users");
  
  console.log("\n💰 To fund the contract:");
  console.log(`   - Transfer CCOP tokens to: ${contractAddress}`);
  console.log(`   - Recommended amount: At least 1,000,000 CCOP for testing`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 