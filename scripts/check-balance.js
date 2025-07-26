const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Verificando balance de la wallet de producción...");
  
  // Dirección de la wallet de producción
  const PRODUCTION_WALLET = "0xe87Bfa044b2e120195E110ed35EB51Ba2BFC0D6e";
  
  // Obtener provider
  const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
  
  try {
    // Verificar balance de CELO
    const balance = await provider.getBalance(PRODUCTION_WALLET);
    const balanceInCELO = ethers.formatEther(balance);
    
    console.log("📊 Balance de la wallet:", PRODUCTION_WALLET);
    console.log("💰 CELO Balance:", balanceInCELO, "CELO");
    
    // Verificar si es suficiente para deploy
    const estimatedGas = ethers.parseEther("0.05"); // Estimación conservadora
    const hasEnoughFunds = balance > estimatedGas;
    
    console.log("");
    console.log("🎯 Análisis:");
    console.log("   - Balance actual:", balanceInCELO, "CELO");
    console.log("   - Estimado para deploy: 0.05 CELO");
    console.log("   - ¿Suficiente para deploy?", hasEnoughFunds ? "✅ SÍ" : "❌ NO");
    
    if (!hasEnoughFunds) {
      const needed = ethers.formatEther(estimatedGas - balance);
      console.log("");
      console.log("⚠️  Necesitas transferir al menos:", needed, "CELO");
      console.log("📍 A la dirección:", PRODUCTION_WALLET);
      console.log("");
      console.log("💡 Recomendación: Transferir 0.1 CELO para tener margen");
    }
    
    // Verificar balance de cCOP si es posible
    try {
      const cCOPAddress = "0x8A567e2aE79CA692Bd748aB832081C45de4041eA";
      const cCOPToken = new ethers.Contract(
        cCOPAddress,
        ["function balanceOf(address) view returns (uint256)", "function symbol() view returns (string)"],
        provider
      );
      
      const cCOPSymbol = await cCOPToken.symbol();
      const cCOPBalance = await cCOPToken.balanceOf(PRODUCTION_WALLET);
      const cCOPBalanceFormatted = ethers.formatUnits(cCOPBalance, 18);
      
      console.log("");
      console.log("🎯 Balance de cCOP:");
      console.log("   - Token:", cCOPSymbol);
      console.log("   - Balance:", cCOPBalanceFormatted, cCOPSymbol);
      
    } catch (error) {
      console.log("");
      console.log("⚠️  No se pudo verificar balance de cCOP:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Error verificando balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 