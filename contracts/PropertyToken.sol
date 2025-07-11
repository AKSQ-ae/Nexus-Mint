// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PropertyToken
 * @dev ERC1155 multi-token contract for property tokenization with role-based access control
 * Each property gets a unique token ID within this single contract
 */
contract PropertyToken is ERC1155, AccessControl, Pausable, ReentrancyGuard, ERC1155Supply {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    
    struct PropertyInfo {
        string propertyId;
        string title;
        string location;
        uint256 totalValue;
        uint256 totalSupply;
        uint256 pricePerToken;
        bool isActive;
        string metadataURI;
        uint256 metadataFreezeTime; // Timestamp after which metadata cannot be changed
        bool metadataFrozen;
    }
    
    // Property ID counter for creating new properties
    uint256 public nextPropertyId = 1;
    
    // Property info by token ID
    mapping(uint256 => PropertyInfo) public properties;
    
    // Investor tracking by property
    mapping(uint256 => mapping(address => uint256)) public investorTokens;
    mapping(uint256 => address[]) public propertyInvestors;
    mapping(uint256 => mapping(address => bool)) public isPropertyInvestor;
    
    // Income distribution by property
    mapping(uint256 => uint256) public totalIncomeDistributed;
    mapping(uint256 => mapping(address => uint256)) public claimedIncome;
    
    // Events
    event PropertyCreated(uint256 indexed tokenId, string propertyId, uint256 totalSupply, uint256 pricePerToken);
    event TokensPurchased(address indexed investor, uint256 indexed tokenId, uint256 amount, uint256 tokens);
    event PropertyUpdated(uint256 indexed tokenId, string propertyId, uint256 newValue);
    event IncomeDistributed(uint256 indexed tokenId, uint256 amount);
    event IncomeClaimed(address indexed investor, uint256 indexed tokenId, uint256 amount);
    event MetadataFrozen(uint256 indexed tokenId, uint256 freezeTime);
    
    constructor(
        string memory _baseURI,
        address _admin
    ) ERC1155(_baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(PROPERTY_MANAGER_ROLE, _admin);
        _grantRole(FINANCE_ROLE, _admin);
    }
    
    function createProperty(
        string memory _propertyId,
        string memory _title,
        string memory _location,
        uint256 _totalValue,
        uint256 _totalSupply,
        string memory _metadataURI
    ) external onlyRole(PROPERTY_MANAGER_ROLE) returns (uint256) {
        uint256 tokenId = nextPropertyId++;
        uint256 pricePerToken = _totalValue / _totalSupply;
        
        properties[tokenId] = PropertyInfo({
            propertyId: _propertyId,
            title: _title,
            location: _location,
            totalValue: _totalValue,
            totalSupply: _totalSupply,
            pricePerToken: pricePerToken,
            isActive: true,
            metadataURI: _metadataURI,
            metadataFreezeTime: block.timestamp + 7 days, // 7 days to update metadata
            metadataFrozen: false
        });
        
        _mint(address(this), tokenId, _totalSupply, "");
        
        emit PropertyCreated(tokenId, _propertyId, _totalSupply, pricePerToken);
        return tokenId;
    }
    
    function purchaseTokens(uint256 _tokenId, uint256 _tokenAmount) external payable nonReentrant whenNotPaused {
        require(properties[_tokenId].isActive, "Property token sales not active");
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(balanceOf(address(this), _tokenId) >= _tokenAmount, "Not enough tokens available");
        
        uint256 cost = _tokenAmount * properties[_tokenId].pricePerToken;
        require(msg.value >= cost, "Insufficient payment");
        
        // Add to investors list if first purchase
        if (!isPropertyInvestor[_tokenId][msg.sender]) {
            propertyInvestors[_tokenId].push(msg.sender);
            isPropertyInvestor[_tokenId][msg.sender] = true;
        }
        
        // Update investor balance tracking
        investorTokens[_tokenId][msg.sender] += _tokenAmount;
        
        // Transfer tokens from contract to investor
        _safeTransferFrom(address(this), msg.sender, _tokenId, _tokenAmount, "");
        
        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        emit TokensPurchased(msg.sender, _tokenId, cost, _tokenAmount);
    }
    
    function distributeIncome(uint256 _tokenId) external payable onlyRole(FINANCE_ROLE) nonReentrant {
        require(msg.value > 0, "No income to distribute");
        require(totalSupply(_tokenId) > balanceOf(address(this), _tokenId), "No tokens sold yet");
        
        totalIncomeDistributed[_tokenId] += msg.value;
        emit IncomeDistributed(_tokenId, msg.value);
    }
    
    function claimIncome(uint256 _tokenId) external nonReentrant {
        uint256 userBalance = balanceOf(msg.sender, _tokenId);
        require(userBalance > 0, "No tokens owned");
        
        uint256 circulatingSupply = totalSupply(_tokenId) - balanceOf(address(this), _tokenId);
        uint256 userShare = (totalIncomeDistributed[_tokenId] * userBalance) / circulatingSupply;
        uint256 claimableAmount = userShare - claimedIncome[_tokenId][msg.sender];
        
        require(claimableAmount > 0, "No income to claim");
        require(address(this).balance >= claimableAmount, "Insufficient contract balance");
        
        claimedIncome[_tokenId][msg.sender] = userShare;
        payable(msg.sender).transfer(claimableAmount);
        
        emit IncomeClaimed(msg.sender, _tokenId, claimableAmount);
    }
    
    function getClaimableIncome(uint256 _tokenId, address _investor) external view returns (uint256) {
        uint256 userBalance = balanceOf(_investor, _tokenId);
        if (userBalance == 0) return 0;
        
        uint256 circulatingSupply = totalSupply(_tokenId) - balanceOf(address(this), _tokenId);
        if (circulatingSupply == 0) return 0;
        
        uint256 userShare = (totalIncomeDistributed[_tokenId] * userBalance) / circulatingSupply;
        return userShare - claimedIncome[_tokenId][_investor];
    }
    
    function updatePropertyValue(uint256 _tokenId, uint256 _newValue) external onlyRole(PROPERTY_MANAGER_ROLE) {
        properties[_tokenId].totalValue = _newValue;
        properties[_tokenId].pricePerToken = _newValue / properties[_tokenId].totalSupply;
        emit PropertyUpdated(_tokenId, properties[_tokenId].propertyId, _newValue);
    }
    
    function updateMetadataURI(uint256 _tokenId, string memory _newURI) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(!properties[_tokenId].metadataFrozen, "Metadata is permanently frozen");
        require(block.timestamp < properties[_tokenId].metadataFreezeTime, "Metadata freeze period expired");
        
        properties[_tokenId].metadataURI = _newURI;
    }
    
    function freezeMetadata(uint256 _tokenId) external onlyRole(ADMIN_ROLE) {
        properties[_tokenId].metadataFrozen = true;
        emit MetadataFrozen(_tokenId, block.timestamp);
    }
    
    function togglePropertyActive(uint256 _tokenId) external onlyRole(PROPERTY_MANAGER_ROLE) {
        properties[_tokenId].isActive = !properties[_tokenId].isActive;
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    function withdrawContractBalance() external onlyRole(FINANCE_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    function getInvestorCount(uint256 _tokenId) external view returns (uint256) {
        return propertyInvestors[_tokenId].length;
    }
    
    function getAvailableTokens(uint256 _tokenId) external view returns (uint256) {
        return balanceOf(address(this), _tokenId);
    }
    
    function getPropertyInfo(uint256 _tokenId) external view returns (PropertyInfo memory) {
        return properties[_tokenId];
    }
    
    function getInvestors(uint256 _tokenId) external view returns (address[] memory) {
        return propertyInvestors[_tokenId];
    }
    
    function uri(uint256 _tokenId) public view override returns (string memory) {
        return properties[_tokenId].metadataURI;
    }
    
    // Override to handle batch operations and supply tracking
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
        
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            if (to != address(0) && to != address(this) && !isPropertyInvestor[tokenId][to] && amounts[i] > 0) {
                propertyInvestors[tokenId].push(to);
                isPropertyInvestor[tokenId][to] = true;
            }
        }
    }
    
    // Required override for AccessControl
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC1155, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}