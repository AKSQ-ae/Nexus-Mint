// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title NexusMintShariaPropertyToken
 * @dev Production-ready Sharia-compliant property tokenization for Nexus Mint platform
 * @notice Each token represents a unique property that must be certified by Sharia board
 */
contract NexusMintShariaPropertyToken is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;
    
    // Brand-neutral admin role constant
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");
    // Deprecated alias (maintains backward compatibility)
    // solhint-disable-next-line var-name-mixedcase
    bytes32 public constant NEXUS_ADMIN_ROLE = PLATFORM_ADMIN_ROLE;
    bytes32 public constant SHARIA_BOARD_ROLE = keccak256("SHARIA_BOARD_ROLE");
    
    Counters.Counter private _tokenIds;
    EnumerableSet.UintSet private _allTokenIds;
    
    /// @dev Interface for validating NexusMintShariaToken contracts
    interface INexusMintShariaToken {
        function propertyTokenId() external view returns (uint256);
    }
    
    /// @dev Property information struct
    struct ShariaProperty {
        string nexusPropertyId;      
        string dubaiBrokerageId;     
        string propertyAddress;
        uint256 totalValueAED;       
        uint256 tokenizationDate;
        bool isShariaCompliant;
        bytes32 complianceCertHash;  
        address fractionalContract;  
        uint256 totalShares;         
        bool isActive;
        string[5] permittedUses;      
        uint256 certificationExpiry; 
    }
    
    mapping(uint256 => ShariaProperty) public properties;
    mapping(string => uint256) public nexusIdToTokenId;
    mapping(address => bool) public authorizedContracts;
    
    event PropertyTokenized(uint256 indexed tokenId, string nexusId, string dubaiBrokerageId, uint256 valueAED, uint256 totalShares, string[5] permittedUses);
    event ShariaCompliant(uint256 indexed tokenId, bytes32 certificateHash, uint256 expiryDate);
    event ShariaRevoked(uint256 indexed tokenId, string reason);
    event FractionalTokenLinked(uint256 indexed tokenId, address tokenContract);
    event PropertyUpdated(uint256 indexed tokenId, string updateType);
    
    constructor() ERC721("Sharia Property Token", "SPT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Tokenize property with comprehensive validation
     */
    function tokenizeProperty(
        string memory nexusId,
        string memory dubaiBrokerageId,
        string memory propertyAddress,
        uint256 valueAED,
        uint256 totalShares,
        string[5] memory permittedUses,
        string memory metadataURI
    ) external onlyRole(PLATFORM_ADMIN_ROLE) returns (uint256) {
        require(bytes(nexusId).length > 0, "Empty nexusId");
        require(bytes(dubaiBrokerageId).length > 0, "Empty dubaiBrokerageId");
        require(bytes(propertyAddress).length > 0, "Empty propertyAddress");
        require(bytes(metadataURI).length > 0, "Empty metadataURI");
        require(valueAED > 0, "Value must be positive");
        require(totalShares > 0, "Total shares must be positive");
        require(nexusIdToTokenId[nexusId] == 0, "Property already tokenized");
        
        for (uint256 i = 0; i < 5; i++) {
            require(bytes(permittedUses[i]).length > 0, "Empty permitted use");
        }
        
        require(bytes(metadataURI).length >= 7, "Metadata URI too short");
        bytes memory prefix = new bytes(7);
        for (uint256 i = 0; i < 7; i++) {
            prefix[i] = bytes(metadataURI)[i];
        }
        require(keccak256(prefix) == keccak256("ipfs://"), "Invalid metadata URI format");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        properties[newTokenId] = ShariaProperty({
            nexusPropertyId: nexusId,
            dubaiBrokerageId: dubaiBrokerageId,
            propertyAddress: propertyAddress,
            totalValueAED: valueAED,
            tokenizationDate: block.timestamp,
            isShariaCompliant: false,
            complianceCertHash: bytes32(0),
            fractionalContract: address(0),
            totalShares: totalShares,
            isActive: false,
            permittedUses: permittedUses,
            certificationExpiry: 0
        });
        
        nexusIdToTokenId[nexusId] = newTokenId;
        _allTokenIds.add(newTokenId);
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        emit PropertyTokenized(newTokenId, nexusId, dubaiBrokerageId, valueAED, totalShares, permittedUses);
        return newTokenId;
    }
    
    /**
     * @dev Certify Sharia compliance with expiration validation
     */
    function certifySharia(
        uint256 tokenId,
        bytes32 certificateHash,
        uint256 expiryTimestamp
    ) external onlyRole(SHARIA_BOARD_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(expiryTimestamp > block.timestamp, "Expiry must be in future");
        require(certificateHash != bytes32(0), "Invalid certificate hash");
        
        properties[tokenId].isShariaCompliant = true;
        properties[tokenId].complianceCertHash = certificateHash;
        properties[tokenId].certificationExpiry = expiryTimestamp;
        
        emit ShariaCompliant(tokenId, certificateHash, expiryTimestamp);
    }
    
    /**
     * @dev Revoke Sharia compliance
     */
    function revokeSharia(uint256 tokenId, string memory reason) external onlyRole(SHARIA_BOARD_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(bytes(reason).length > 0, "Reason required");
        require(bytes(reason).length <= 256, "Reason too long");
        
        properties[tokenId].isShariaCompliant = false;
        properties[tokenId].isActive = false;
        
        emit ShariaRevoked(tokenId, reason);
    }
    
    /**
     * @dev Link fractional token contract
     */
    function linkFractionalContract(uint256 tokenId, address contractAddress) external onlyRole(PLATFORM_ADMIN_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(properties[tokenId].isShariaCompliant, "Not Sharia compliant");
        require(properties[tokenId].certificationExpiry > block.timestamp, "Sharia certification expired");
        require(contractAddress != address(0), "Invalid contract address");
        require(properties[tokenId].fractionalContract == address(0), "Already linked");
        
        properties[tokenId].fractionalContract = contractAddress;
        properties[tokenId].isActive = true;
        authorizedContracts[contractAddress] = true;
        
        emit FractionalTokenLinked(tokenId, contractAddress);
    }
    
    /**
     * @dev Update fractional contract address
     */
    function updateFractionalContract(uint256 tokenId, address newContractAddress) external onlyRole(PLATFORM_ADMIN_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(properties[tokenId].isShariaCompliant, "Not Sharia compliant");
        require(properties[tokenId].certificationExpiry > block.timestamp, "Sharia certification expired");
        require(newContractAddress != address(0), "Invalid contract address");
        require(newContractAddress != properties[tokenId].fractionalContract, "Same contract address");
        
        try INexusMintShariaToken(newContractAddress).propertyTokenId() returns (uint256 linkedTokenId) {
            require(linkedTokenId == tokenId, "Contract not linked to this property");
        } catch {
            revert("Invalid NexusMintShariaToken contract");
        }
        
        address oldContract = properties[tokenId].fractionalContract;
        properties[tokenId].fractionalContract = newContractAddress;
        
        if (oldContract != address(0)) {
            authorizedContracts[oldContract] = false;
        }
        authorizedContracts[newContractAddress] = true;
        
        emit FractionalTokenLinked(tokenId, newContractAddress);
    }
    
    /**
     * @dev Update permitted uses
     */
    function updatePermittedUses(uint256 tokenId, string[5] memory newUses) external onlyRole(SHARIA_BOARD_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(properties[tokenId].isShariaCompliant, "Not Sharia compliant");
        
        for (uint256 i = 0; i < 5; i++) {
            require(bytes(newUses[i]).length > 0, "Empty permitted use");
        }
        
        properties[tokenId].permittedUses = newUses;
        emit PropertyUpdated(tokenId, "Permitted uses updated");
    }
    
    /**
     * @dev Get property details
     */
    function getPropertyDetails(uint256 tokenId) external view returns (
        string memory nexusId,
        uint256 valueAED,
        bool isShariaCompliant,
        address fractionalContract,
        bool isActive,
        uint256 certificationExpiry
    ) {
        require(_exists(tokenId), "Property does not exist");
        
        ShariaProperty memory prop = properties[tokenId];
        return (
            prop.nexusPropertyId,
            prop.totalValueAED,
            prop.isShariaCompliant,
            prop.fractionalContract,
            prop.isActive,
            prop.certificationExpiry
        );
    }
    
    /**
     * @dev Get total properties
     */
    function getTotalProperties() external view returns (uint256 count) {
        return _allTokenIds.length();
    }
    
    /**
     * @dev Get property by index
     */
    function getPropertyByIndex(uint256 index) external view returns (uint256 tokenId) {
        require(index < _allTokenIds.length(), "Index out of bounds");
        return _allTokenIds.at(index);
    }
    
    /**
     * @dev Check if Sharia certification is valid
     */
    function isShariaCertificationValid(uint256 tokenId) external view returns (bool isValid) {
        require(_exists(tokenId), "Property does not exist");
        return properties[tokenId].isShariaCompliant && 
               properties[tokenId].certificationExpiry > block.timestamp;
    }
    
    /**
     * @dev Add role member
     */
    function addRoleMember(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid account");
        grantRole(role, account);
    }
    
    /**
     * @dev Remove role member
     */
    function removeRoleMember(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(role, account);
    }
}