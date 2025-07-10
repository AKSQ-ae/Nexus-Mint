// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title PropertyToken
 * @dev ERC1155 token contract for fractional real estate ownership
 */
contract PropertyToken is ERC1155, Ownable, Pausable, ERC1155Supply {
    mapping(uint256 => PropertyMetadata) public properties;
    mapping(uint256 => mapping(address => uint256)) public investments;
    mapping(uint256 => uint256) public propertyIncome;
    
    uint256 public nextPropertyId = 1;
    
    struct PropertyMetadata {
        string name;
        uint256 totalTokens;
        uint256 tokenPrice;
        uint256 totalValue;
        bool active;
        string metadataURI;
    }
    
    event PropertyCreated(uint256 indexed propertyId, string name, uint256 totalTokens);
    event TokensPurchased(uint256 indexed propertyId, address indexed buyer, uint256 amount);
    event IncomeDistributed(uint256 indexed propertyId, uint256 amount);
    
    constructor() ERC1155("") {}
    
    function createProperty(
        string memory _name,
        uint256 _totalTokens,
        uint256 _tokenPrice,
        uint256 _totalValue,
        string memory _metadataURI
    ) external onlyOwner {
        uint256 propertyId = nextPropertyId++;
        
        properties[propertyId] = PropertyMetadata({
            name: _name,
            totalTokens: _totalTokens,
            tokenPrice: _tokenPrice,
            totalValue: _totalValue,
            active: true,
            metadataURI: _metadataURI
        });
        
        _mint(address(this), propertyId, _totalTokens, "");
        
        emit PropertyCreated(propertyId, _name, _totalTokens);
    }
    
    function purchaseTokens(uint256 _propertyId, uint256 _amount) external payable whenNotPaused {
        PropertyMetadata storage property = properties[_propertyId];
        require(property.active, "Property not active");
        require(_amount > 0, "Amount must be greater than 0");
        require(msg.value == _amount * property.tokenPrice, "Incorrect payment amount");
        require(balanceOf(address(this), _propertyId) >= _amount, "Insufficient tokens available");
        
        _safeTransferFrom(address(this), msg.sender, _propertyId, _amount, "");
        investments[_propertyId][msg.sender] += _amount;
        
        emit TokensPurchased(_propertyId, msg.sender, _amount);
    }
    
    function distributeIncome(uint256 _propertyId) external payable onlyOwner {
        require(msg.value > 0, "No income to distribute");
        propertyIncome[_propertyId] += msg.value;
        emit IncomeDistributed(_propertyId, msg.value);
    }
    
    function claimIncome(uint256 _propertyId) external {
        uint256 userTokens = balanceOf(msg.sender, _propertyId);
        require(userTokens > 0, "No tokens owned");
        
        uint256 totalIncome = propertyIncome[_propertyId];
        uint256 userShare = (totalIncome * userTokens) / properties[_propertyId].totalTokens;
        
        require(userShare > 0, "No income to claim");
        
        propertyIncome[_propertyId] -= userShare;
        payable(msg.sender).transfer(userShare);
    }
    
    function uri(uint256 _propertyId) public view override returns (string memory) {
        return properties[_propertyId].metadataURI;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}