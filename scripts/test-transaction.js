const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing ownerClaimForUser transaction...");

  // Contract address
  const CONTRACT_ADDRESS = "0x0B2719dd0710170d9cDe15a55C7D459Af3924D44";
  
  // Test user address (you can change this)
  const TEST_USER_ADDRESS = "0x12BD1596d7cfbf7c18F08499B54A31C980989070";
  
  // Get the contract
  const CCOPDispenser = await hre.ethers.getContractFactory("CCOPDispenser");
  const contract = CCOPDispenser.attach(CONTRACT_ADDRESS);
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Signer address:", await signer.getAddress());
  
  // Check user eligibility before transaction
  console.log("\n📋 Checking user eligibility...");
  try {
    const claimInfo = await contract.getUserClaimInfo(TEST_USER_ADDRESS);
    console.log("   - Total Claims:", claimInfo[1].toString());
    console.log("   - Claimed Today:", claimInfo[2]);
    console.log("   - Remaining Claims:", claimInfo[3].toString());
    console.log("   - Can Claim Now:", claimInfo[4]);
  } catch (error) {
    console.log("   - Error checking eligibility:", error.message);
  }
  
  // Check contract balance
  console.log("\n💰 Checking contract balance...");
  try {
    const balance = await contract.getContractBalance();
    console.log("   - Contract CCOP Balance:", hre.ethers.formatUnits(balance, 18), "CCOP");
  } catch (error) {
    console.log("   - Error checking balance:", error.message);
  }
  
  // Execute the transaction
  console.log("\n🚀 Executing ownerClaimForUser transaction...");
  try {
    const tx = await contract.ownerClaimForUser(TEST_USER_ADDRESS);
    console.log("   - Transaction hash:", tx.hash);
    console.log("   - Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("   - Transaction confirmed!");
    console.log("   - Gas used:", receipt.gasUsed.toString());
    console.log("   - Block number:", receipt.blockNumber);
    
    // Check user eligibility after transaction
    console.log("\n📋 Checking user eligibility after transaction...");
    const claimInfoAfter = await contract.getUserClaimInfo(TEST_USER_ADDRESS);
    console.log("   - Total Claims:", claimInfoAfter[1].toString());
    console.log("   - Claimed Today:", claimInfoAfter[2]);
    console.log("   - Remaining Claims:", claimInfoAfter[3].toString());
    console.log("   - Can Claim Now:", claimInfoAfter[4]);
    
    console.log("\n✅ Transaction successful!");
    console.log("🎯 User", TEST_USER_ADDRESS, "received 25,000 CCOP tokens");
    
  } catch (error) {
    console.log("❌ Transaction failed:", error.message);
    
    // Check if it's a specific contract error
    if (error.message.includes("AlreadyClaimedToday")) {
      console.log("   - User has already claimed tokens today");
    } else if (error.message.includes("MaxLifetimeClaimsReached")) {
      console.log("   - User has reached maximum lifetime claims");
    } else if (error.message.includes("InsufficientTokenBalance")) {
      console.log("   - Contract has insufficient token balance");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 