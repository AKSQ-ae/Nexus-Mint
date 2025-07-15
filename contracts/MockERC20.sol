// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev Mock AED stablecoin for testing Nexus Mint Sharia platform
 * @notice This is for testing only - use real AED stablecoin in production
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _customDecimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _customDecimals = decimals_;
        _mint(msg.sender, initialSupply);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }
    
    /**
     * @dev Mint additional tokens (for testing purposes)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Faucet function for easy testing
     */
    function faucet(address to, uint256 amount) external {
        require(amount <= 1000000 * 10**_customDecimals, "Faucet limit exceeded");
        _mint(to, amount);
    }
}