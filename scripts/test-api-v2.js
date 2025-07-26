const fetch = require('node-fetch');

async function main() {
  console.log("🧪 Probando API V2 de Etherscan con Celo...");
  
  const CONTRACT_ADDRESS = "0x7Bc8a97C4f8e685cE0fcB8CCE354d0B0393A92A0";
  const API_KEY = "VZFDUWB3YGQ1YCDKTCU1D6DDSS";
  const CHAIN_ID = 42220; // Celo Mainnet
  
  console.log("📋 Configuración:");
  console.log("   - Chain ID:", CHAIN_ID);
  console.log("   - API Key:", API_KEY);
  console.log("   - Endpoint: https://api.etherscan.io/v2/api");
  
  try {
    console.log("\n🔍 Probando consulta de balance...");
    
    // Probar consulta de balance usando API V2
    const balanceQuery = `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=account&action=balance&address=${CONTRACT_ADDRESS}&tag=latest&apikey=${API_KEY}`;
    
    console.log("   - URL:", balanceQuery);
    
    const balanceResponse = await fetch(balanceQuery);
    const balanceData = await balanceResponse.json();
    
    console.log("   - Respuesta:", JSON.stringify(balanceData, null, 2));
    
    if (balanceData.status === "1") {
      console.log("✅ API V2 funcionando correctamente!");
      console.log("   - Balance:", balanceData.result);
    } else {
      console.log("❌ Error en API V2:", balanceData.message);
    }
    
    console.log("\n🔍 Probando consulta de contrato...");
    
    // Probar consulta de contrato usando API V2
    const contractQuery = `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=contract&action=getabi&address=${CONTRACT_ADDRESS}&apikey=${API_KEY}`;
    
    const contractResponse = await fetch(contractQuery);
    const contractData = await contractResponse.json();
    
    console.log("   - Respuesta:", JSON.stringify(contractData, null, 2));
    
    if (contractData.status === "1") {
      console.log("✅ Contrato encontrado en API V2!");
    } else {
      console.log("❌ Error consultando contrato:", contractData.message);
    }
    
  } catch (error) {
    console.log("❌ Error en prueba:", error.message);
  }
  
  console.log("\n📋 Información de API V2:");
  console.log("   - Base URL: https://api.etherscan.io/v2/api");
  console.log("   - Chain ID: 42220 (Celo Mainnet)");
  console.log("   - Soporte oficial: ✅ Confirmado");
  console.log("   - Documentación: https://docs.etherscan.io/etherscan-v2/supported-chains");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 