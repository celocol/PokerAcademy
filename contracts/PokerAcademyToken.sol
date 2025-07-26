// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PokerAcademyToken
 * @dev Token contract for Poker Academy with daily claim functionality
 */
contract PokerAcademyToken is ERC20, Ownable, ReentrancyGuard {
    
    // Constants
    uint256 public constant DAILY_CLAIM_AMOUNT = 25000 * 10**18; // 25,000 tokens with 18 decimals
    uint256 public constant MAX_LIFETIME_CLAIMS = 3;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // State variables
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaims;
    mapping(address => bool) public hasClaimedToday;
    
    // Events
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event DailyReset(address indexed user, uint256 timestamp);
    
    // Custom errors
    error AlreadyClaimedToday();
    error MaxLifetimeClaimsReached();
    error DailyLimitNotReset();
    error InvalidClaimTime();
    error TransferFailed();
    
    constructor() ERC20("Poker Academy Token", "POKER") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // Initial supply: 1M tokens
    }
    
    /**
     * @dev Allows users to claim their daily tokens
     * Can only claim once per day (resets at midnight UTC)
     * Maximum 3 claims per lifetime
     */
    function claimDailyTokens() external nonReentrant {
        address user = msg.sender;
        
        // Check if user has reached maximum lifetime claims
        if (totalClaims[user] >= MAX_LIFETIME_CLAIMS) {
            revert MaxLifetimeClaimsReached();
        }
        
        uint256 currentTime = block.timestamp;
        uint256 lastClaim = lastClaimTime[user];
        
        // Check if it's a new day and reset the daily claim flag if needed
        if (lastClaim != 0 && _isSameDay(lastClaim, currentTime)) {
            // Same day, check if already claimed
            if (hasClaimedToday[user]) {
                revert AlreadyClaimedToday();
            }
        } else {
            // New day or first claim, reset the daily claim flag
            hasClaimedToday[user] = false;
        }
        
        // Mark as claimed today and update state
        hasClaimedToday[user] = true;
        lastClaimTime[user] = currentTime;
        totalClaims[user]++;
        
        // Mint tokens to user
        _mint(user, DAILY_CLAIM_AMOUNT);
        
        emit TokensClaimed(user, DAILY_CLAIM_AMOUNT, currentTime);
    }
    
    /**
     * @dev Check if two timestamps are on the same day (UTC)
     */
    function _isSameDay(uint256 timestamp1, uint256 timestamp2) internal pure returns (bool) {
        uint256 day1 = timestamp1 / SECONDS_PER_DAY;
        uint256 day2 = timestamp2 / SECONDS_PER_DAY;
        return day1 == day2;
    }
    
    /**
     * @dev Get user's claim information
     */
    function getUserClaimInfo(address user) external view returns (
        uint256 lastClaim,
        uint256 totalClaimsMade,
        bool claimedToday,
        uint256 remainingClaims,
        bool canClaimNow
    ) {
        lastClaim = lastClaimTime[user];
        totalClaimsMade = totalClaims[user];
        remainingClaims = MAX_LIFETIME_CLAIMS - totalClaimsMade;
        
        // Check if user has claimed today (considering day reset)
        uint256 currentTime = block.timestamp;
        if (lastClaim != 0 && _isSameDay(lastClaim, currentTime)) {
            claimedToday = hasClaimedToday[user];
        } else {
            claimedToday = false; // New day, hasn't claimed yet
        }
        
        // Check if user can claim now
        canClaimNow = totalClaimsMade < MAX_LIFETIME_CLAIMS && !claimedToday;
    }
    
    /**
     * @dev Get time until next claim is available (in seconds)
     */
    function getTimeUntilNextClaim(address user) external view returns (uint256) {
        if (totalClaims[user] >= MAX_LIFETIME_CLAIMS) {
            return 0; // No more claims available
        }
        
        uint256 currentTime = block.timestamp;
        uint256 lastClaim = lastClaimTime[user];
        
        // Check if user has claimed today (considering day reset)
        bool claimedToday;
        if (lastClaim != 0 && _isSameDay(lastClaim, currentTime)) {
            claimedToday = hasClaimedToday[user];
        } else {
            claimedToday = false; // New day, hasn't claimed yet
        }
        
        if (!claimedToday) {
            return 0; // Can claim now
        }
        
        // Calculate time until next day (midnight UTC)
        uint256 currentDay = currentTime / SECONDS_PER_DAY;
        uint256 nextDay = (currentDay + 1) * SECONDS_PER_DAY;
        
        return nextDay - currentTime;
    }
    
    /**
     * @dev Emergency function to reset daily claim for a user (owner only)
     */
    function emergencyResetDailyClaim(address user) external onlyOwner {
        hasClaimedToday[user] = false;
        emit DailyReset(user, block.timestamp);
    }
    
    /**
     * @dev Override transfer function to add custom logic if needed
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        bool success = super.transfer(to, amount);
        if (!success) {
            revert TransferFailed();
        }
        return success;
    }
    
    /**
     * @dev Override transferFrom function to add custom logic if needed
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        bool success = super.transferFrom(from, to, amount);
        if (!success) {
            revert TransferFailed();
        }
        return success;
    }
} 