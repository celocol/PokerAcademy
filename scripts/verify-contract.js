const hre = require("hardhat");

async function main() {
  console.log("🔍 Verificando contrato en Celoscan...");
  
  const CONTRACT_ADDRESS = "0x7Bc8a97C4f8e685cE0fcB8CCE354d0B0393A92A0";
  const CCOP_TOKEN_ADDRESS = "0x8A567e2aE79CA692Bd748aB832081C45de4041eA";
  const API_KEY = "VZFDUWB3YGQ1YCDKTCU1D6DDSS";
  
  console.log("📋 Información del contrato:");
  console.log("   - Dirección:", CONTRACT_ADDRESS);
  console.log("   - Token cCOP:", CCOP_TOKEN_ADDRESS);
  console.log("   - API Key:", API_KEY ? "✅ Configurada" : "❌ No encontrada");
  
  try {
    console.log("\n🔍 Iniciando verificación...");
    
    await hre.run("verify:verify", {
      address: CONTRACT_ADDRESS,
      constructorArguments: [CCOP_TOKEN_ADDRESS],
    });
    
    console.log("✅ ¡Contrato verificado exitosamente en Celoscan!");
    console.log("🌐 Ver en: https://celoscan.io/address/" + CONTRACT_ADDRESS);
    
  } catch (error) {
    console.log("❌ Error en verificación:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("✅ El contrato ya está verificado en Celoscan");
      console.log("🌐 Ver en: https://celoscan.io/address/" + CONTRACT_ADDRESS);
    } else if (error.message.includes("API token")) {
      console.log("⚠️  Problema con API key. Verificando manualmente...");
      
      // Verificar manualmente
      console.log("\n📋 Verificación manual:");
      console.log("1. Ve a: https://celoscan.io/address/" + CONTRACT_ADDRESS);
      console.log("2. Haz clic en 'Contract' tab");
      console.log("3. Haz clic en 'Verify and Publish'");
      console.log("4. Selecciona 'Solidity (Single file)'");
      console.log("5. Compiler Version: 0.8.20");
      console.log("6. Optimization: Enabled, 200 runs");
      console.log("7. Constructor Arguments (ABI-encoded):");
      
      // Mostrar constructor arguments
      const constructorArgs = [CCOP_TOKEN_ADDRESS];
      console.log("   - Token Address:", constructorArgs[0]);
      
    } else {
      console.log("❌ Error desconocido:", error.message);
    }
  }
  
  console.log("\n📋 Información adicional:");
  console.log("   - Contrato: CCOPDispenser");
  console.log("   - Red: Celo Mainnet");
  console.log("   - Timezone: UTC-5 (Colombia)");
  console.log("   - Reset: Medianoche Colombia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 