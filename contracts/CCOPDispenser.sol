// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title CCOPDispenser
 * @dev Contract for distributing CCOP tokens with daily limits and gasless transactions
 */
contract CCOPDispenser is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    
    // CCOP Token Contract Address
    IERC20Metadata public immutable ccopToken;
    
    // Constants
    uint256 public constant DAILY_CLAIM_AMOUNT = 25000 * 10**18; // 25,000 CCOP tokens with 18 decimals
    uint256 public constant MAX_LIFETIME_CLAIMS = 3;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // State variables
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaims;
    mapping(address => bool) public hasClaimedToday;
    mapping(bytes32 => bool) public usedSignatures;
    
    // Events
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event GaslessTokensClaimed(address indexed user, uint256 amount, uint256 timestamp, address relayer);
    event DailyReset(address indexed user, uint256 timestamp);
    event TokensWithdrawn(address indexed owner, uint256 amount);
    
    // Custom errors
    error AlreadyClaimedToday();
    error MaxLifetimeClaimsReached();
    error InsufficientTokenBalance();
    error TransferFailed();
    error InvalidSignature();
    error SignatureAlreadyUsed();
    error InvalidNonce();
    
    constructor(address _ccopTokenAddress) Ownable(msg.sender) {
        ccopToken = IERC20Metadata(_ccopTokenAddress);
    }
    
    /**
     * @dev Allows users to claim their daily CCOP tokens (requires gas)
     * Can only claim once per day (resets at midnight UTC)
     * Maximum 3 claims per lifetime
     */
    function claimDailyTokens() external nonReentrant {
        _processClaim(msg.sender);
    }
    
    /**
     * @dev Gasless claim function - user doesn't pay gas fees
     * @param user The address that wants to claim tokens
     * @param deadline The deadline for the signature
     * @param signature The signature from the user
     */
    function claimDailyTokensGasless(
        address user,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        require(block.timestamp <= deadline, "Signature expired");
        
        bytes32 messageHash = keccak256(abi.encodePacked(
            user,
            deadline,
            address(this)
        ));
        
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ecrecover(ethSignedMessageHash, uint8(signature[64]), bytes32(signature[0:32]), bytes32(signature[32:64]));
        
        require(signer == user, "Invalid signature");
        require(!usedSignatures[messageHash], "Signature already used");
        
        usedSignatures[messageHash] = true;
        _processClaim(user);
        
        emit GaslessTokensClaimed(user, DAILY_CLAIM_AMOUNT, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Internal function to process the claim logic
     */
    function _processClaim(address user) internal {
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
        
        // Check if contract has enough tokens
        if (ccopToken.balanceOf(address(this)) < DAILY_CLAIM_AMOUNT) {
            revert InsufficientTokenBalance();
        }
        
        // Mark as claimed today and update state
        hasClaimedToday[user] = true;
        lastClaimTime[user] = currentTime;
        totalClaims[user]++;
        
        // Transfer tokens to user
        bool success = ccopToken.transfer(user, DAILY_CLAIM_AMOUNT);
        if (!success) {
            revert TransferFailed();
        }
        
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
        canClaimNow = totalClaimsMade < MAX_LIFETIME_CLAIMS && 
                     !claimedToday && 
                     ccopToken.balanceOf(address(this)) >= DAILY_CLAIM_AMOUNT;
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
     * @dev Withdraw remaining tokens from contract (owner only)
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        uint256 balance = ccopToken.balanceOf(address(this));
        require(amount <= balance, "Insufficient balance");
        
        bool success = ccopToken.transfer(owner(), amount);
        require(success, "Transfer failed");
        
        emit TokensWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Get contract's CCOP token balance
     */
    function getContractBalance() external view returns (uint256) {
        return ccopToken.balanceOf(address(this));
    }
    
    /**
     * @dev Get CCOP token information
     */
    function getTokenInfo() external view returns (
        address tokenAddress,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 tokenDecimals
    ) {
        tokenAddress = address(ccopToken);
        tokenName = ccopToken.name();
        tokenSymbol = ccopToken.symbol();
        tokenDecimals = ccopToken.decimals();
    }
} 