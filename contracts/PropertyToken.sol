// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PropertyToken
 * @dev ERC20 token contract for individual property tokenization
 * Each property gets its own ERC20 token contract
 */
contract PropertyToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    struct PropertyInfo {
        string propertyId;
        string title;
        string location;
        uint256 totalValue;
        uint256 totalSupply;
        uint256 pricePerToken;
        bool isActive;
        string metadataURI;
    }
    
    PropertyInfo public propertyInfo;
    
    // Investor tracking
    mapping(address => uint256) public investorTokens;
    address[] public investors;
    mapping(address => bool) public isInvestor;
    
    // Income distribution
    uint256 public totalIncomeDistributed;
    mapping(address => uint256) public claimedIncome;
    
    // Events
    event TokensPurchased(address indexed investor, uint256 amount, uint256 tokens);
    event DividendsDistributed(uint256 totalAmount, uint256 perToken);
    event PropertyUpdated(string propertyId, uint256 newValue);
    event IncomeDistributed(uint256 amount);
    event IncomeClaimed(address indexed investor, uint256 amount);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _propertyId,
        string memory _title,
        string memory _location,
        uint256 _totalValue,
        uint256 _totalSupply,
        string memory _metadataURI,
        address _owner
    ) ERC20(_name, _symbol) {
        propertyInfo = PropertyInfo({
            propertyId: _propertyId,
            title: _title,
            location: _location,
            totalValue: _totalValue,
            totalSupply: _totalSupply,
            pricePerToken: _totalValue / _totalSupply,
            isActive: true,
            metadataURI: _metadataURI
        });
        
        _mint(address(this), _totalSupply);
        _transferOwnership(_owner);
    }
    
    function purchaseTokens(uint256 _tokenAmount) external payable nonReentrant whenNotPaused {
        require(propertyInfo.isActive, "Property token sales not active");
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(balanceOf(address(this)) >= _tokenAmount, "Not enough tokens available");
        
        uint256 cost = _tokenAmount * propertyInfo.pricePerToken;
        require(msg.value >= cost, "Insufficient payment");
        
        // Add to investors list if first purchase
        if (!isInvestor[msg.sender]) {
            investors.push(msg.sender);
            isInvestor[msg.sender] = true;
        }
        
        // Update investor balance tracking
        investorTokens[msg.sender] += _tokenAmount;
        
        // Transfer tokens from contract to investor
        _transfer(address(this), msg.sender, _tokenAmount);
        
        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        emit TokensPurchased(msg.sender, cost, _tokenAmount);
    }
    
    function distributeIncome() external payable onlyOwner nonReentrant {
        require(msg.value > 0, "No income to distribute");
        require(totalSupply() > balanceOf(address(this)), "No tokens sold yet");
        
        totalIncomeDistributed += msg.value;
        emit IncomeDistributed(msg.value);
    }
    
    function claimIncome() external nonReentrant {
        uint256 userBalance = balanceOf(msg.sender);
        require(userBalance > 0, "No tokens owned");
        
        uint256 circulatingSupply = totalSupply() - balanceOf(address(this));
        uint256 userShare = (totalIncomeDistributed * userBalance) / circulatingSupply;
        uint256 claimableAmount = userShare - claimedIncome[msg.sender];
        
        require(claimableAmount > 0, "No income to claim");
        require(address(this).balance >= claimableAmount, "Insufficient contract balance");
        
        claimedIncome[msg.sender] = userShare;
        payable(msg.sender).transfer(claimableAmount);
        
        emit IncomeClaimed(msg.sender, claimableAmount);
    }
    
    function getClaimableIncome(address _investor) external view returns (uint256) {
        uint256 userBalance = balanceOf(_investor);
        if (userBalance == 0) return 0;
        
        uint256 circulatingSupply = totalSupply() - balanceOf(address(this));
        if (circulatingSupply == 0) return 0;
        
        uint256 userShare = (totalIncomeDistributed * userBalance) / circulatingSupply;
        return userShare - claimedIncome[_investor];
    }
    
    function updatePropertyValue(uint256 _newValue) external onlyOwner {
        propertyInfo.totalValue = _newValue;
        propertyInfo.pricePerToken = _newValue / propertyInfo.totalSupply;
        emit PropertyUpdated(propertyInfo.propertyId, _newValue);
    }
    
    function updateMetadataURI(string memory _newURI) external onlyOwner {
        propertyInfo.metadataURI = _newURI;
    }
    
    function togglePropertyActive() external onlyOwner {
        propertyInfo.isActive = !propertyInfo.isActive;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawContractBalance() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function getInvestorCount() external view returns (uint256) {
        return investors.length;
    }
    
    function getAvailableTokens() external view returns (uint256) {
        return balanceOf(address(this));
    }
    
    function getPropertyInfo() external view returns (PropertyInfo memory) {
        return propertyInfo;
    }
    
    function getInvestors() external view returns (address[] memory) {
        return investors;
    }
    
    // Override transfer to update investor tracking
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        
        if (to != address(0) && to != address(this) && !isInvestor[to] && amount > 0) {
            investors.push(to);
            isInvestor[to] = true;
        }
    }
}