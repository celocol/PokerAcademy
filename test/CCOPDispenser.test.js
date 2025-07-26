const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CCOPDispenser", function () {
  let CCOPDispenser;
  let MockERC20;
  let ccopDispenser;
  let mockCCOP;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy mock CCOP token
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockCCOP = await MockERC20.deploy("CCOP Token", "CCOP");
    
    // Deploy CCOP Dispenser
    CCOPDispenser = await ethers.getContractFactory("CCOPDispenser");
    ccopDispenser = await CCOPDispenser.deploy(await mockCCOP.getAddress());
    
    // Transfer some tokens to the dispenser contract
    await mockCCOP.mint(await ccopDispenser.getAddress(), ethers.parseEther("1000000")); // 1M tokens
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ccopDispenser.owner()).to.equal(owner.address);
    });

    it("Should set the correct CCOP token address", async function () {
      expect(await ccopDispenser.ccopToken()).to.equal(await mockCCOP.getAddress());
    });

    it("Should have correct constants", async function () {
      expect(await ccopDispenser.DAILY_CLAIM_AMOUNT()).to.equal(ethers.parseEther("25000"));
      expect(await ccopDispenser.MAX_LIFETIME_CLAIMS()).to.equal(3);
      expect(await ccopDispenser.SECONDS_PER_DAY()).to.equal(86400);
    });

    it("Should have initial token balance", async function () {
      expect(await ccopDispenser.getContractBalance()).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Daily Token Claims", function () {
    it("Should allow first claim", async function () {
      const initialBalance = await mockCCOP.balanceOf(user1.address);
      
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      const finalBalance = await mockCCOP.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("25000"));
    });

    it("Should not allow claiming twice in the same day", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      await expect(
        ccopDispenser.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(ccopDispenser, "AlreadyClaimedToday");
    });

    it("Should allow claiming on different days", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      // Simulate time passing (next day)
      await ethers.provider.send("evm_increaseTime", [86400]); // 24 hours
      await ethers.provider.send("evm_mine");
      
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      const balance = await mockCCOP.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("50000")); // 25k + 25k
    });

    it("Should track total claims correctly", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      const info = await ccopDispenser.getUserClaimInfo(user1.address);
      expect(info[1]).to.equal(1); // totalClaims
    });
  });

  describe("Lifetime Claim Limits", function () {
    it("Should allow maximum 3 claims per wallet", async function () {
      // First claim
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      // Second claim (next day)
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      // Third claim (next day)
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      // Fourth claim should fail
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        ccopDispenser.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(ccopDispenser, "MaxLifetimeClaimsReached");
    });

    it("Should track remaining claims correctly", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      const info = await ccopDispenser.getUserClaimInfo(user1.address);
      expect(info[3]).to.equal(2); // remainingClaims (3 - 1)
    });
  });

  describe("Token Balance Checks", function () {
    it("Should revert when contract has insufficient tokens", async function () {
      // Drain the contract
      await ccopDispenser.connect(owner).withdrawTokens(ethers.parseEther("1000000"));
      
      await expect(
        ccopDispenser.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(ccopDispenser, "InsufficientTokenBalance");
    });

    it("Should allow claims when contract has sufficient tokens", async function () {
      // Ensure contract has enough tokens
      await mockCCOP.mint(await ccopDispenser.getAddress(), ethers.parseEther("50000"));
      
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      const balance = await mockCCOP.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("25000"));
    });
  });

  describe("User Information", function () {
    it("Should return correct user claim info", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      const info = await ccopDispenser.getUserClaimInfo(user1.address);
      
      expect(info[0]).to.not.equal(0); // lastClaimTime
      expect(info[1]).to.equal(1); // totalClaims
      expect(info[2]).to.be.true; // claimedToday
      expect(info[3]).to.equal(2); // remainingClaims
      expect(info[4]).to.be.false; // canClaimNow (because claimed today)
    });

    it("Should return correct time until next claim", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      const timeUntil = await ccopDispenser.getTimeUntilNextClaim(user1.address);
      expect(timeUntil).to.be.greaterThan(0);
    });

    it("Should return 0 time when can claim now", async function () {
      const timeUntil = await ccopDispenser.getTimeUntilNextClaim(user1.address);
      expect(timeUntil).to.equal(0);
    });
  });

  describe("Error Handling", function () {
    it("Should revert with correct error for already claimed today", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      await expect(
        ccopDispenser.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(ccopDispenser, "AlreadyClaimedToday");
    });

    it("Should revert with correct error for max lifetime claims", async function () {
      // Make 3 claims
      for (let i = 0; i < 3; i++) {
        await ccopDispenser.connect(user1).claimDailyTokens();
        if (i < 2) {
          await ethers.provider.send("evm_increaseTime", [86400]);
          await ethers.provider.send("evm_mine");
        }
      }
      
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        ccopDispenser.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(ccopDispenser, "MaxLifetimeClaimsReached");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to reset daily claim", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      await ccopDispenser.connect(owner).emergencyResetDailyClaim(user1.address);
      
      // Should be able to claim again
      await ccopDispenser.connect(user1).claimDailyTokens();
    });

    it("Should not allow non-owner to reset daily claim", async function () {
      await expect(
        ccopDispenser.connect(user1).emergencyResetDailyClaim(user2.address)
      ).to.be.revertedWithCustomError(ccopDispenser, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw tokens", async function () {
      const initialBalance = await mockCCOP.balanceOf(owner.address);
      const contractBalance = await ccopDispenser.getContractBalance();
      
      await ccopDispenser.connect(owner).withdrawTokens(contractBalance);
      
      const finalBalance = await mockCCOP.balanceOf(owner.address);
      expect(finalBalance - initialBalance).to.equal(contractBalance);
    });

    it("Should not allow non-owner to withdraw tokens", async function () {
      await expect(
        ccopDispenser.connect(user1).withdrawTokens(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(ccopDispenser, "OwnableUnauthorizedAccount");
    });
  });

  describe("Multiple Users", function () {
    it("Should handle multiple users independently", async function () {
      // User 1 claims
      await ccopDispenser.connect(user1).claimDailyTokens();
      
      // User 2 should still be able to claim
      await ccopDispenser.connect(user2).claimDailyTokens();
      
      // Check balances
      expect(await mockCCOP.balanceOf(user1.address)).to.equal(ethers.parseEther("25000"));
      expect(await mockCCOP.balanceOf(user2.address)).to.equal(ethers.parseEther("25000"));
    });

    it("Should track claims per user correctly", async function () {
      await ccopDispenser.connect(user1).claimDailyTokens();
      await ccopDispenser.connect(user2).claimDailyTokens();
      
      const info1 = await ccopDispenser.getUserClaimInfo(user1.address);
      const info2 = await ccopDispenser.getUserClaimInfo(user2.address);
      
      expect(info1[1]).to.equal(1); // user1 total claims
      expect(info2[1]).to.equal(1); // user2 total claims
    });
  });

  describe("Token Information", function () {
    it("Should return correct token info", async function () {
      const tokenInfo = await ccopDispenser.getTokenInfo();
      
      expect(tokenInfo[0]).to.equal(await mockCCOP.getAddress()); // tokenAddress
      expect(tokenInfo[1]).to.equal("CCOP Token"); // tokenName
      expect(tokenInfo[2]).to.equal("CCOP"); // tokenSymbol
      expect(tokenInfo[3]).to.equal(18); // tokenDecimals
    });
  });
});

// Mock ERC20 Token for testing
describe("MockERC20", function () {
  let MockERC20;
  let mockToken;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Test Token", "TEST");
  });

  it("Should have correct name and symbol", async function () {
    expect(await mockToken.name()).to.equal("Test Token");
    expect(await mockToken.symbol()).to.equal("TEST");
    expect(await mockToken.decimals()).to.equal(18);
  });

  it("Should allow minting", async function () {
    await mockToken.mint(user1.address, ethers.parseEther("1000"));
    expect(await mockToken.balanceOf(user1.address)).to.equal(ethers.parseEther("1000"));
  });
}); 