const { ethers } = require("hardhat");

async function generateGaslessSignature(userAddress, deadline) {
  console.log("🔐 Generating gasless signature...");
  
  // Create the message hash
  const contractAddress = "0xa5100dFD6C966aC60a8E497a3545B49B12Dd45BC"; // Update with your contract address
  const messageHash = ethers.keccak256(ethers.solidityPacked(
    ["address", "uint256", "address"],
    [userAddress, deadline, contractAddress]
  ));
  
  // Sign the message (this would be done by the user's wallet)
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // User's private key
  const wallet = new ethers.Wallet(privateKey);
  
  // Create the signature
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));
  
  console.log("✅ Gasless signature generated:");
  console.log("   User Address:", userAddress);
  console.log("   Deadline:", deadline);
  console.log("   Contract Address:", contractAddress);
  console.log("   Message Hash:", messageHash);
  console.log("   Signature:", signature);
  
  return {
    userAddress,
    deadline,
    signature,
    messageHash
  };
}

// Example usage
async function main() {
  const userAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  
  await generateGaslessSignature(userAddress, deadline);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error generating signature:", error);
      process.exit(1);
    });
}

module.exports = { generateGaslessSignature }; 