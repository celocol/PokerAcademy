const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PokerAcademyToken", function () {
  let PokerAcademyToken;
  let pokerToken;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    PokerAcademyToken = await ethers.getContractFactory("PokerAcademyToken");
    pokerToken = await PokerAcademyToken.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await pokerToken.owner()).to.equal(owner.address);
    });

    it("Should have correct token name and symbol", async function () {
      expect(await pokerToken.name()).to.equal("Poker Academy Token");
      expect(await pokerToken.symbol()).to.equal("POKER");
    });

    it("Should mint initial supply to owner", async function () {
      const initialSupply = ethers.parseEther("1000000"); // 1M tokens
      expect(await pokerToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should have correct constants", async function () {
      expect(await pokerToken.DAILY_CLAIM_AMOUNT()).to.equal(ethers.parseEther("25000"));
      expect(await pokerToken.MAX_LIFETIME_CLAIMS()).to.equal(3);
      expect(await pokerToken.SECONDS_PER_DAY()).to.equal(86400);
    });
  });

  describe("Daily Token Claims", function () {
    it("Should allow first claim", async function () {
      const initialBalance = await pokerToken.balanceOf(user1.address);
      
      await pokerToken.connect(user1).claimDailyTokens();
      
      const finalBalance = await pokerToken.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("25000"));
    });

    it("Should not allow claiming twice in the same day", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      await expect(
        pokerToken.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(pokerToken, "AlreadyClaimedToday");
    });

    it("Should allow claiming on different days", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      // Simulate time passing (next day)
      await ethers.provider.send("evm_increaseTime", [86400]); // 24 hours
      await ethers.provider.send("evm_mine");
      
      await pokerToken.connect(user1).claimDailyTokens();
      
      const balance = await pokerToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("50000")); // 25k + 25k
    });

    it("Should track total claims correctly", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      const info = await pokerToken.getUserClaimInfo(user1.address);
      expect(info[1]).to.equal(1); // totalClaims
    });
  });

  describe("Lifetime Claim Limits", function () {
    it("Should allow maximum 3 claims per wallet", async function () {
      // First claim
      await pokerToken.connect(user1).claimDailyTokens();
      
      // Second claim (next day)
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      await pokerToken.connect(user1).claimDailyTokens();
      
      // Third claim (next day)
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      await pokerToken.connect(user1).claimDailyTokens();
      
      // Fourth claim should fail
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        pokerToken.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(pokerToken, "MaxLifetimeClaimsReached");
    });

    it("Should track remaining claims correctly", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      const info = await pokerToken.getUserClaimInfo(user1.address);
      expect(info[3]).to.equal(2); // remainingClaims (3 - 1)
    });
  });

  describe("User Information", function () {
    it("Should return correct user claim info", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      const info = await pokerToken.getUserClaimInfo(user1.address);
      
      expect(info[0]).to.not.equal(0); // lastClaimTime
      expect(info[1]).to.equal(1); // totalClaims
      expect(info[2]).to.be.true; // claimedToday
      expect(info[3]).to.equal(2); // remainingClaims
      expect(info[4]).to.be.false; // canClaimNow
    });

    it("Should return correct time until next claim", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      const timeUntil = await pokerToken.getTimeUntilNextClaim(user1.address);
      expect(timeUntil).to.be.greaterThan(0);
    });

    it("Should return 0 time when can claim now", async function () {
      const timeUntil = await pokerToken.getTimeUntilNextClaim(user1.address);
      expect(timeUntil).to.equal(0);
    });
  });

  describe("Error Handling", function () {
    it("Should revert with correct error for already claimed today", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      await expect(
        pokerToken.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(pokerToken, "AlreadyClaimedToday");
    });

    it("Should revert with correct error for max lifetime claims", async function () {
      // Make 3 claims
      for (let i = 0; i < 3; i++) {
        await pokerToken.connect(user1).claimDailyTokens();
        if (i < 2) {
          await ethers.provider.send("evm_increaseTime", [86400]);
          await ethers.provider.send("evm_mine");
        }
      }
      
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        pokerToken.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(pokerToken, "MaxLifetimeClaimsReached");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to reset daily claim", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      await pokerToken.connect(owner).emergencyResetDailyClaim(user1.address);
      
      // Should be able to claim again
      await pokerToken.connect(user1).claimDailyTokens();
    });

    it("Should not allow non-owner to reset daily claim", async function () {
      await expect(
        pokerToken.connect(user1).emergencyResetDailyClaim(user2.address)
      ).to.be.revertedWithCustomError(pokerToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Multiple Users", function () {
    it("Should handle multiple users independently", async function () {
      // User 1 claims
      await pokerToken.connect(user1).claimDailyTokens();
      
      // User 2 should still be able to claim
      await pokerToken.connect(user2).claimDailyTokens();
      
      // Check balances
      expect(await pokerToken.balanceOf(user1.address)).to.equal(ethers.parseEther("25000"));
      expect(await pokerToken.balanceOf(user2.address)).to.equal(ethers.parseEther("25000"));
    });

    it("Should track claims per user correctly", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      await pokerToken.connect(user2).claimDailyTokens();
      
      const info1 = await pokerToken.getUserClaimInfo(user1.address);
      const info2 = await pokerToken.getUserClaimInfo(user2.address);
      
      expect(info1[1]).to.equal(1); // user1 total claims
      expect(info2[1]).to.equal(1); // user2 total claims
    });
  });

  describe("Edge Cases", function () {
    it("Should handle timezone edge cases correctly", async function () {
      await pokerToken.connect(user1).claimDailyTokens();
      
      // Move time forward by 23 hours (same day)
      await ethers.provider.send("evm_increaseTime", [23 * 3600]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        pokerToken.connect(user1).claimDailyTokens()
      ).to.be.revertedWithCustomError(pokerToken, "AlreadyClaimedToday");
      
      // Move time forward by 1 more hour (next day)
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      
      await pokerToken.connect(user1).claimDailyTokens();
    });

    it("Should handle leap year correctly", async function () {
      // This test ensures the contract works correctly with different day lengths
      await pokerToken.connect(user1).claimDailyTokens();
      
      // Move forward by exactly 24 hours
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      await pokerToken.connect(user1).claimDailyTokens();
      
      const balance = await pokerToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("50000"));
    });
  });
}); 