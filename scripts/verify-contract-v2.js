const hre = require("hardhat");

async function main() {
  console.log("🔍 Verificando contrato con Etherscan API V2...");
  
  const CONTRACT_ADDRESS = "0x7Bc8a97C4f8e685cE0fcB8CCE354d0B0393A92A0";
  const CCOP_TOKEN_ADDRESS = "0x8A567e2aE79CA692Bd748aB832081C45de4041eA";
  const API_KEY = "VZFDUWB3YGQ1YCDKTCU1D6DDSS";
  const CHAIN_ID = 42220; // Celo Mainnet
  
  console.log("📋 Información del contrato:");
  console.log("   - Dirección:", CONTRACT_ADDRESS);
  console.log("   - Token cCOP:", CCOP_TOKEN_ADDRESS);
  console.log("   - Chain ID:", CHAIN_ID);
  console.log("   - API Key:", API_KEY ? "✅ Configurada" : "❌ No encontrada");
  console.log("   - API URL: https://api.etherscan.io/v2/api");
  
  try {
    console.log("\n🔍 Iniciando verificación con API V2...");
    
    // Usar la nueva API V2 de Etherscan
    await hre.run("verify:verify", {
      address: CONTRACT_ADDRESS,
      constructorArguments: [CCOP_TOKEN_ADDRESS],
    });
    
    console.log("✅ ¡Contrato verificado exitosamente!");
    console.log("🌐 Ver en: https://celoscan.io/address/" + CONTRACT_ADDRESS);
    
  } catch (error) {
    console.log("❌ Error en verificación:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("✅ El contrato ya está verificado en Celoscan");
      console.log("🌐 Ver en: https://celoscan.io/address/" + CONTRACT_ADDRESS);
    } else if (error.message.includes("API token")) {
      console.log("⚠️  Problema con API key. Probando verificación manual...");
      
      // Probar verificación manual con API V2
      console.log("\n📋 Verificación manual con API V2:");
      console.log("1. Ve a: https://celoscan.io/address/" + CONTRACT_ADDRESS);
      console.log("2. Haz clic en 'Contract' tab");
      console.log("3. Haz clic en 'Verify and Publish'");
      console.log("4. Selecciona 'Solidity (Single file)'");
      console.log("5. Compiler Version: 0.8.20");
      console.log("6. Optimization: Enabled, 200 runs");
      console.log("7. Constructor Arguments (ABI-encoded):");
      console.log("   - Token Address:", CCOP_TOKEN_ADDRESS);
      
      // Mostrar información de API V2
      console.log("\n🔧 Información de API V2:");
      console.log("   - Endpoint: https://api.etherscan.io/v2/api");
      console.log("   - Chain ID:", CHAIN_ID);
      console.log("   - API Key:", API_KEY);
      
    } else {
      console.log("❌ Error desconocido:", error.message);
    }
  }
  
  console.log("\n📋 Información adicional:");
  console.log("   - Contrato: CCOPDispenser");
  console.log("   - Red: Celo Mainnet (Chain ID: 42220)");
  console.log("   - Timezone: UTC-5 (Colombia)");
  console.log("   - Reset: Medianoche Colombia");
  console.log("   - API V2: Etherscan unificada");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 