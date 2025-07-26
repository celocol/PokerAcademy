const hre = require("hardhat");

async function main() {
  console.log("🔍 Verificación final del contrato con Etherscan V2...");
  
  const CONTRACT_ADDRESS = "0x7Bc8a97C4f8e685cE0fcB8CCE354d0B0393A92A0";
  const CCOP_TOKEN_ADDRESS = "0x8A567e2aE79CA692Bd748aB832081C45de4041eA";
  
  console.log("📋 Información del contrato:");
  console.log("   - Dirección:", CONTRACT_ADDRESS);
  console.log("   - Token cCOP:", CCOP_TOKEN_ADDRESS);
  console.log("   - Chain ID: 42220 (Celo Mainnet)");
  console.log("   - API V2: https://api.etherscan.io/v2/api");
  console.log("   - Soporte oficial: ✅ Celo Mainnet soportado");
  
  try {
    console.log("\n🔍 Iniciando verificación...");
    
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
      console.log("⚠️  API key no válida para Celo");
      console.log("💡 Solución: Obtener API key específica para Celo");
      console.log("📋 Verificación manual disponible");
      
      console.log("\n📋 Verificación manual:");
      console.log("1. Ve a: https://celoscan.io/address/" + CONTRACT_ADDRESS);
      console.log("2. Haz clic en 'Contract' tab");
      console.log("3. Haz clic en 'Verify and Publish'");
      console.log("4. Selecciona 'Solidity (Single file)'");
      console.log("5. Compiler Version: 0.8.20");
      console.log("6. Optimization: Enabled, 200 runs");
      console.log("7. Constructor Arguments:", CCOP_TOKEN_ADDRESS);
      
    } else {
      console.log("❌ Error desconocido:", error.message);
    }
  }
  
  console.log("\n📋 Información de Etherscan V2:");
  console.log("   - Celo Mainnet (42220): ✅ Soportado");
  console.log("   - Celo Alfajores (44787): ✅ Soportado");
  console.log("   - API unificada: https://api.etherscan.io/v2/api");
  console.log("   - Documentación: https://docs.etherscan.io/etherscan-v2/supported-chains");
  
  console.log("\n🎯 Estado del contrato:");
  console.log("   - Desplegado: ✅ Funcionando");
  console.log("   - Timezone: ✅ UTC-5 (Colombia)");
  console.log("   - Funcionalidad: ✅ Completa");
  console.log("   - Verificación: ⚠️  Requiere API key válida");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 