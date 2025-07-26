// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev Mock ERC20 token for testing purposes
 */
contract MockERC20 is ERC20, Ownable {
    
    constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {}
    
    /**
     * @dev Mint tokens (for testing only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens (for testing only)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
} 