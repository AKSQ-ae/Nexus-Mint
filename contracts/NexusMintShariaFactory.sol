// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./NexusMintShariaPropertyToken.sol";
import "./NexusMintShariaToken.sol";
import "./NexusMintShariaMarketplace.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NexusMintShariaFactory
 * @dev Unified deployment and management system for all Nexus Mint Sharia contracts
 * @notice One-stop factory for creating complete property tokenization ecosystems
 */
contract NexusMintShariaFactory is AccessControl, ReentrancyGuard {
    
    bytes32 public constant NEXUS_ADMIN_ROLE = keccak256("NEXUS_ADMIN_ROLE");
    bytes32 public constant SHARIA_BOARD_ROLE = keccak256("SHARIA_BOARD_ROLE");
    
    // Registry of all deployed contracts
    NexusMintShariaPropertyToken public immutable propertyRegistry;
    NexusMintShariaMarketplace public immutable marketplace;
    
    // Payment token for the ecosystem
    address public immutable aedToken;
    
    // Tracking deployed fractional tokens
    mapping(uint256 => address) public propertyToFractionalToken;
    mapping(address => uint256) public fractionalTokenToProperty;
    mapping(address => bool) public isValidFractionalToken;
    
    // Property deployment tracking
    uint256[] public allDeployedProperties;
    mapping(string => uint256) public nexusIdToPropertyId;
    
    // Events for unified tracking
    event PropertyEcosystemCreated(
        uint256 indexed propertyTokenId,
        address indexed fractionalTokenContract,
        string nexusPropertyId,
        string tokenName,
        string tokenSymbol,
        uint256 totalSupply,
        uint256 valuationAED
    );
    
    event PropertyOnboarded(
        uint256 indexed propertyTokenId,
        string nexusPropertyId,
        string dubaiBrokerageId,
        uint256 valueAED,
        uint256 totalShares
    );
    
    event ShariaCompleteFlow(
        uint256 indexed propertyTokenId,
        address indexed fractionalTokenContract,
        bytes32 certificateHash,
        uint256 expiryDate
    );
    
    constructor(address _aedToken, address _shariaBoard) {
        require(_aedToken != address(0), "Invalid AED token");
        require(_shariaBoard != address(0), "Invalid Sharia board");
        
        aedToken = _aedToken;
        
        // Deploy core infrastructure
        propertyRegistry = new NexusMintShariaPropertyToken();
        marketplace = new NexusMintShariaMarketplace(_aedToken);
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(NEXUS_ADMIN_ROLE, msg.sender);
        _grantRole(SHARIA_BOARD_ROLE, _shariaBoard);
        
        // Grant roles to deployed contracts
        propertyRegistry.addRoleMember(propertyRegistry.NEXUS_ADMIN_ROLE(), msg.sender);
        propertyRegistry.addRoleMember(propertyRegistry.SHARIA_BOARD_ROLE(), _shariaBoard);
        
        marketplace.addRoleMember(marketplace.NEXUS_ADMIN_ROLE(), msg.sender);
        marketplace.addRoleMember(marketplace.SHARIA_SUPERVISOR_ROLE(), _shariaBoard);
    }
    
    /**
     * @dev Create complete property ecosystem in one transaction
     */
    function createPropertyEcosystem(
        // Property NFT parameters
        string memory nexusPropertyId,
        string memory dubaiBrokerageId,
        string memory propertyAddress,
        uint256 propertyValueAED,
        uint256 totalShares,
        string[5] memory permittedUses,
        string memory metadataURI,
        
        // Fractional token parameters
        string memory tokenName,
        string memory tokenSymbol,
        uint256 totalSupply
    ) external onlyRole(NEXUS_ADMIN_ROLE) nonReentrant returns (
        uint256 propertyTokenId,
        address fractionalTokenContract
    ) {
        require(bytes(nexusPropertyId).length > 0, "Empty nexus property ID");
        require(nexusIdToPropertyId[nexusPropertyId] == 0, "Property already exists");
        require(totalSupply > 0, "Total supply must be positive");
        require(propertyValueAED > 0, "Property value must be positive");
        
        // 1. Create property NFT
        propertyTokenId = propertyRegistry.tokenizeProperty(
            nexusPropertyId,
            dubaiBrokerageId,
            propertyAddress,
            propertyValueAED,
            totalShares,
            permittedUses,
            metadataURI
        );
        
        // 2. Deploy fractional token contract
        NexusMintShariaToken fractionalToken = new NexusMintShariaToken(
            tokenName,
            tokenSymbol,
            totalSupply,
            propertyTokenId,
            address(propertyRegistry),
            nexusPropertyId,
            dubaiBrokerageId,
            aedToken,
            propertyValueAED
        );
        
        fractionalTokenContract = address(fractionalToken);
        
        // 3. Setup roles for fractional token
        fractionalToken.addRoleMember(fractionalToken.NEXUS_PLATFORM_ROLE(), msg.sender);
        fractionalToken.addRoleMember(fractionalToken.PROPERTY_MANAGER_ROLE(), msg.sender);
        fractionalToken.addRoleMember(fractionalToken.SHARIA_SUPERVISOR_ROLE(), getRoleMember(SHARIA_BOARD_ROLE, 0));
        
        // 4. Register in mappings
        propertyToFractionalToken[propertyTokenId] = fractionalTokenContract;
        fractionalTokenToProperty[fractionalTokenContract] = propertyTokenId;
        isValidFractionalToken[fractionalTokenContract] = true;
        nexusIdToPropertyId[nexusPropertyId] = propertyTokenId;
        allDeployedProperties.push(propertyTokenId);
        
        // 5. Authorize in marketplace
        marketplace.authorizeToken(fractionalTokenContract);
        
        emit PropertyEcosystemCreated(
            propertyTokenId,
            fractionalTokenContract,
            nexusPropertyId,
            tokenName,
            tokenSymbol,
            totalSupply,
            propertyValueAED
        );
        
        emit PropertyOnboarded(
            propertyTokenId,
            nexusPropertyId,
            dubaiBrokerageId,
            propertyValueAED,
            totalShares
        );
        
        return (propertyTokenId, fractionalTokenContract);
    }
    
    /**
     * @dev Complete Sharia certification flow for property
     */
    function certifyPropertySharia(
        uint256 propertyTokenId,
        bytes32 certificateHash,
        uint256 expiryTimestamp
    ) external onlyRole(SHARIA_BOARD_ROLE) {
        require(propertyToFractionalToken[propertyTokenId] != address(0), "Property not found");
        
        // Certify property NFT
        propertyRegistry.certifySharia(propertyTokenId, certificateHash, expiryTimestamp);
        
        // Link fractional contract to property
        address fractionalContract = propertyToFractionalToken[propertyTokenId];
        propertyRegistry.linkFractionalContract(propertyTokenId, fractionalContract);
        
        emit ShariaCompleteFlow(propertyTokenId, fractionalContract, certificateHash, expiryTimestamp);
    }
    
    /**
     * @dev Onboard investor to fractional token (unified interface)
     */
    function onboardInvestor(
        uint256 propertyTokenId,
        address investor,
        uint256 tokenAmount,
        uint256 investmentAED,
        bool kycStatus,
        bool shariaAcceptance
    ) external onlyRole(NEXUS_ADMIN_ROLE) {
        address fractionalContract = propertyToFractionalToken[propertyTokenId];
        require(fractionalContract != address(0), "Property not found");
        
        NexusMintShariaToken token = NexusMintShariaToken(fractionalContract);
        token.onboardInvestor(investor, tokenAmount, investmentAED, kycStatus, shariaAcceptance);
    }
    
    /**
     * @dev Get complete property ecosystem info
     */
    function getPropertyEcosystem(uint256 propertyTokenId) external view returns (
        // Property NFT info
        string memory nexusId,
        uint256 valueAED,
        bool isShariaCompliant,
        bool isActive,
        uint256 certificationExpiry,
        
        // Fractional token info
        address fractionalTokenContract,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 totalSupply,
        uint256 investorCount,
        
        // Financial summary
        uint256 totalRentalAED,
        uint256 totalDistributedAED,
        uint256 currentValuationAED
    ) {
        require(propertyToFractionalToken[propertyTokenId] != address(0), "Property not found");
        
        // Get property details
        (nexusId, valueAED, isShariaCompliant, fractionalTokenContract, isActive, certificationExpiry) = 
            propertyRegistry.getPropertyDetails(propertyTokenId);
        
        // Get fractional token details
        NexusMintShariaToken token = NexusMintShariaToken(fractionalTokenContract);
        tokenName = token.name();
        tokenSymbol = token.symbol();
        totalSupply = token.totalSupply();
        investorCount = token.getInvestorCount();
        
        // Get financial summary
        (totalRentalAED, , totalDistributedAED, currentValuationAED, , , , , ) = 
            token.getPropertySummary();
    }
    
    /**
     * @dev Get investor dashboard across all properties
     */
    function getInvestorPortfolio(address investor) external view returns (
        uint256[] memory propertyTokenIds,
        uint256[] memory tokenBalances,
        uint256[] memory totalInvestedAED,
        uint256[] memory currentValuesAED,
        uint256[] memory pendingReturnsAED
    ) {
        uint256 portfolioCount = 0;
        
        // First pass: count investor's properties
        for (uint256 i = 0; i < allDeployedProperties.length; i++) {
            uint256 propertyId = allDeployedProperties[i];
            address fractionalContract = propertyToFractionalToken[propertyId];
            if (fractionalContract != address(0)) {
                NexusMintShariaToken token = NexusMintShariaToken(fractionalContract);
                if (token.balanceOf(investor) > 0) {
                    portfolioCount++;
                }
            }
        }
        
        // Initialize arrays
        propertyTokenIds = new uint256[](portfolioCount);
        tokenBalances = new uint256[](portfolioCount);
        totalInvestedAED = new uint256[](portfolioCount);
        currentValuesAED = new uint256[](portfolioCount);
        pendingReturnsAED = new uint256[](portfolioCount);
        
        // Second pass: populate data
        uint256 index = 0;
        for (uint256 i = 0; i < allDeployedProperties.length; i++) {
            uint256 propertyId = allDeployedProperties[i];
            address fractionalContract = propertyToFractionalToken[propertyId];
            if (fractionalContract != address(0)) {
                NexusMintShariaToken token = NexusMintShariaToken(fractionalContract);
                uint256 balance = token.balanceOf(investor);
                if (balance > 0) {
                    propertyTokenIds[index] = propertyId;
                    tokenBalances[index] = balance;
                    
                    (, , uint256 invested, , uint256 currentValue, uint256 pending, ) = 
                        token.getInvestorDashboard(investor);
                    
                    totalInvestedAED[index] = invested;
                    currentValuesAED[index] = currentValue;
                    pendingReturnsAED[index] = pending;
                    index++;
                }
            }
        }
    }
    
    /**
     * @dev Get marketplace stats for all properties
     */
    function getMarketplaceOverview() external view returns (
        uint256 totalProperties,
        uint256 activeProperties,
        uint256 totalActiveListings,
        uint256 accumulatedFeesAED
    ) {
        totalProperties = allDeployedProperties.length;
        
        // Count active properties
        for (uint256 i = 0; i < allDeployedProperties.length; i++) {
            (, , bool isCompliant, , bool isActive, uint256 expiry) = 
                propertyRegistry.getPropertyDetails(allDeployedProperties[i]);
            if (isCompliant && isActive && expiry > block.timestamp) {
                activeProperties++;
            }
        }
        
        // Get marketplace stats
        (, totalActiveListings, accumulatedFeesAED) = marketplace.getMarketplaceStats();
    }
    
    /**
     * @dev Get all deployed properties
     */
    function getAllProperties() external view returns (uint256[] memory) {
        return allDeployedProperties;
    }
    
    /**
     * @dev Get property count
     */
    function getPropertyCount() external view returns (uint256) {
        return allDeployedProperties.length;
    }
    
    /**
     * @dev Emergency functions delegation
     */
    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Could implement pausable functionality if needed
        // This would require upgrading the base contracts to include Pausable
    }
    
    /**
     * @dev Add role member to all contracts
     */
    function addGlobalRoleMember(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid account");
        
        // Add to factory
        grantRole(role, account);
        
        // Add to property registry if applicable
        if (role == NEXUS_ADMIN_ROLE) {
            propertyRegistry.addRoleMember(propertyRegistry.NEXUS_ADMIN_ROLE(), account);
            marketplace.addRoleMember(marketplace.NEXUS_ADMIN_ROLE(), account);
        } else if (role == SHARIA_BOARD_ROLE) {
            propertyRegistry.addRoleMember(propertyRegistry.SHARIA_BOARD_ROLE(), account);
            marketplace.addRoleMember(marketplace.SHARIA_SUPERVISOR_ROLE(), account);
        }
    }
    
    /**
     * @dev Remove role member from all contracts
     */
    function removeGlobalRoleMember(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Remove from factory
        revokeRole(role, account);
        
        // Remove from property registry if applicable
        if (role == NEXUS_ADMIN_ROLE) {
            propertyRegistry.removeRoleMember(propertyRegistry.NEXUS_ADMIN_ROLE(), account);
            marketplace.removeRoleMember(marketplace.NEXUS_ADMIN_ROLE(), account);
        } else if (role == SHARIA_BOARD_ROLE) {
            propertyRegistry.removeRoleMember(propertyRegistry.SHARIA_BOARD_ROLE(), account);
            marketplace.removeRoleMember(marketplace.SHARIA_SUPERVISOR_ROLE(), account);
        }
    }
}