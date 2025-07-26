const fetch = require('node-fetch');
const fs = require('fs');

async function main() {
  console.log("🔍 Verificación POST del contrato con Etherscan V2...");
  
  const CONTRACT_ADDRESS = "0x7Bc8a97C4f8e685cE0fcB8CCE354d0B0393A92A0";
  const CCOP_TOKEN_ADDRESS = "0x8A567e2aE79CA692Bd748aB832081C45de4041eA";
  const API_KEY = "12H79Z815WI8IEWIIGVTN2NNX6E2EU8JH7";
  const CHAIN_ID = 42220; // Celo Mainnet
  
  console.log("📋 Información del contrato:");
  console.log("   - Dirección:", CONTRACT_ADDRESS);
  console.log("   - Token cCOP:", CCOP_TOKEN_ADDRESS);
  console.log("   - Chain ID:", CHAIN_ID);
  console.log("   - API Key:", API_KEY);
  
  try {
    // Leer el código fuente del contrato
    const sourceCode = fs.readFileSync('./contracts/CCOPDispenser.sol', 'utf8');
    
    console.log("\n📦 Preparando datos para verificación...");
    
    // Preparar datos según la documentación oficial
    const postData = new URLSearchParams({
      chainid: CHAIN_ID.toString(),
      module: 'contract',
      action: 'verifysourcecode',
      apikey: API_KEY,
      codeformat: 'solidity-single-file',
      sourceCode: sourceCode,
      constructorArguements: CCOP_TOKEN_ADDRESS,
      contractaddress: CONTRACT_ADDRESS,
      contractname: 'contracts/CCOPDispenser.sol:CCOPDispenser',
      compilerversion: 'v0.8.20+commit.a1b79de6',
      optimizationUsed: '1',
      runs: '200'
    });
    
    console.log("🔍 Enviando verificación POST...");
    console.log("   - URL: https://api.etherscan.io/v2/api");
    console.log("   - Method: POST");
    console.log("   - Chain ID:", CHAIN_ID);
    
    const response = await fetch('https://api.etherscan.io/v2/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData
    });
    
    const result = await response.json();
    
    console.log("\n📋 Respuesta de verificación:");
    console.log(JSON.stringify(result, null, 2));
    
    if (result.status === "1") {
      console.log("✅ ¡Verificación enviada exitosamente!");
      console.log("   - GUID:", result.result);
      console.log("   - Estado: En proceso de verificación");
      console.log("   - Verificar en: https://celoscan.io/address/" + CONTRACT_ADDRESS);
      
      // Verificar estado después de unos segundos
      console.log("\n⏳ Verificando estado en 5 segundos...");
      setTimeout(async () => {
        try {
          const statusResponse = await fetch(`https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=contract&action=checkverifystatus&guid=${result.result}&apikey=${API_KEY}`);
          const statusResult = await statusResponse.json();
          
          console.log("📋 Estado de verificación:");
          console.log(JSON.stringify(statusResult, null, 2));
          
          if (statusResult.status === "1") {
            console.log("✅ ¡Contrato verificado exitosamente!");
          } else {
            console.log("⚠️  Verificación en proceso o con errores");
          }
        } catch (error) {
          console.log("❌ Error verificando estado:", error.message);
        }
      }, 5000);
      
    } else {
      console.log("❌ Error en verificación:", result.message);
      console.log("   - Resultado:", result.result);
      
      if (result.result.includes("Invalid API Key")) {
        console.log("💡 Solución: Obtener API key válida para Celo");
        console.log("📋 Verificación manual disponible");
      }
    }
    
  } catch (error) {
    console.log("❌ Error en verificación:", error.message);
  }
  
  console.log("\n📋 Información de API V2:");
  console.log("   - Endpoint: https://api.etherscan.io/v2/api");
  console.log("   - Método: HTTP POST");
  console.log("   - Límite: 250 verificaciones/día");
  console.log("   - Documentación: https://docs.etherscan.io/etherscan-v2/api-endpoints/contracts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 