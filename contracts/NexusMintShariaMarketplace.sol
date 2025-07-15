// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NexusMintShariaMarketplace
 * @dev Production-ready secondary marketplace with batch operations and comprehensive fee tracking
 * @notice Facilitates Sharia-compliant trading of fractional property tokens
 */
contract NexusMintShariaMarketplace is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    bytes32 public constant NEXUS_ADMIN_ROLE = keccak256("NEXUS_ADMIN_ROLE");
    bytes32 public constant SHARIA_SUPERVISOR_ROLE = keccak256("SHARIA_SUPERVISOR_ROLE");
    
    /// @dev Interface for validating NexusMintShariaToken contracts
    interface INexusMintShariaToken {
        function propertyTokenId() external view returns (uint256);
        function balanceOf(address account) external view returns (uint256);
        function transfer(address to, uint256 amount) external returns (bool);
        function transferFrom(address from, address to, uint256 amount) external returns (bool);
    }
    
    /// @dev Marketplace listing structure
    struct TokenListing {
        address seller;
        address tokenContract;
        uint256 tokenAmount;
        uint256 pricePerTokenAED;
        uint256 createdAt;
        uint256 expiresAt;
        bool isActive;
        bool shariaApproved;
    }
    
    IERC20 public immutable aedToken;
    mapping(uint256 => TokenListing) public listings;
    mapping(address => bool) public authorizedTokenContracts;
    uint256 private _listingCounter;
    
    // Track active listings for efficient enumeration
    uint256[] private _activeListingIds;
    mapping(uint256 => uint256) private _activeListingIndex;
    
    // Fee tracking and limits
    uint256 public accumulatedFeesAED;
    uint256 public constant MARKETPLACE_FEE_BASIS_POINTS = 100; // 1%
    uint256 public constant LISTING_DURATION_SECONDS = 30 days;
    uint256 public constant MAX_PRICE_PER_TOKEN_AED = 1_000_000 * 1e18; // 1M AED per token max
    uint256 public constant MAX_CLEANUP_REWARD_AED = 1000 * 1e18; // 1000 AED max reward
    uint256 public constant MAX_BATCH_SIZE = 50; // Maximum batch size for operations
    
    event ListingCreated(uint256 indexed listingId, address seller, address tokenContract, uint256 amount, uint256 priceAED, uint256 expiresAt);
    event ListingExecuted(uint256 indexed listingId, address buyer, uint256 totalPriceAED, uint256 feeAED, uint256 sellerAmountAED);
    event ListingCancelled(uint256 indexed listingId);
    event ListingExpired(uint256 indexed listingId);
    event ListingSkipped(uint256 indexed listingId, string reason);
    event ShariaApprovalChanged(uint256 indexed listingId, bool approved);
    event FeesWithdrawn(address recipient, uint256 amountAED);
    
    constructor(address _aedToken) {
        require(_aedToken != address(0), "Invalid AED token address");
        aedToken = IERC20(_aedToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(NEXUS_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Create token listing with comprehensive validation
     */
    function createListing(
        address tokenContract,
        uint256 tokenAmount,
        uint256 pricePerTokenAED
    ) external nonReentrant returns (uint256) {
        require(authorizedTokenContracts[tokenContract], "Token not authorized");
        require(tokenAmount > 0, "Token amount must be positive");
        require(pricePerTokenAED > 0, "Price must be positive");
        require(pricePerTokenAED <= MAX_PRICE_PER_TOKEN_AED, "Price too high");
        
        INexusMintShariaToken token = INexusMintShariaToken(tokenContract);
        require(token.balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");
        
        // Check for potential overflow
        uint256 totalPrice = tokenAmount * pricePerTokenAED;
        require(totalPrice / tokenAmount == pricePerTokenAED, "Price overflow");
        
        _listingCounter++;
        
        listings[_listingCounter] = TokenListing({
            seller: msg.sender,
            tokenContract: tokenContract,
            tokenAmount: tokenAmount,
            pricePerTokenAED: pricePerTokenAED,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + LISTING_DURATION_SECONDS,
            isActive: true,
            shariaApproved: false // Require explicit Sharia approval
        });
        
        // Add to active listings array
        _activeListingIds.push(_listingCounter);
        _activeListingIndex[_listingCounter] = _activeListingIds.length - 1;
        
        // Escrow tokens in marketplace
        token.transferFrom(msg.sender, address(this), tokenAmount);
        
        emit ListingCreated(_listingCounter, msg.sender, tokenContract, tokenAmount, pricePerTokenAED, block.timestamp + LISTING_DURATION_SECONDS);
        return _listingCounter;
    }
    
    /**
     * @dev Approve listing for Sharia compliance
     */
    function approveListingSharia(uint256 listingId) external onlyRole(SHARIA_SUPERVISOR_ROLE) {
        require(listings[listingId].seller != address(0), "Listing does not exist");
        require(listings[listingId].isActive, "Listing not active");
        
        listings[listingId].shariaApproved = true;
        emit ShariaApprovalChanged(listingId, true);
    }
    
    /**
     * @dev Revoke Sharia approval for listing
     */
    function revokeListingSharia(uint256 listingId) external onlyRole(SHARIA_SUPERVISOR_ROLE) {
        require(listings[listingId].seller != address(0), "Listing does not exist");
        
        listings[listingId].shariaApproved = false;
        emit ShariaApprovalChanged(listingId, false);
    }
    
    /**
     * @dev Execute token purchase with enhanced validation
     */
    function executeListing(uint256 listingId) external nonReentrant {
        TokenListing storage listing = listings[listingId];
        require(listing.seller != address(0), "Listing does not exist");
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(listing.shariaApproved, "Not Sharia approved");
        
        uint256 totalPriceAED = listing.tokenAmount * listing.pricePerTokenAED;
        uint256 marketplaceFeeAED = (totalPriceAED * MARKETPLACE_FEE_BASIS_POINTS) / 10000;
        uint256 sellerAmountAED = totalPriceAED - marketplaceFeeAED;
        
        // Transfer payment
        aedToken.safeTransferFrom(msg.sender, listing.seller, sellerAmountAED);
        aedToken.safeTransferFrom(msg.sender, address(this), marketplaceFeeAED);
        
        // Track accumulated fees
        accumulatedFeesAED += marketplaceFeeAED;
        
        // Transfer tokens
        INexusMintShariaToken token = INexusMintShariaToken(listing.tokenContract);
        token.transfer(msg.sender, listing.tokenAmount);
        
        // Deactivate listing
        _deactivateListing(listingId);
        
        emit ListingExecuted(listingId, msg.sender, totalPriceAED, marketplaceFeeAED, sellerAmountAED);
    }
    
    /**
     * @dev Cancel active listing with enhanced validation
     */
    function cancelListing(uint256 listingId) external {
        TokenListing storage listing = listings[listingId];
        require(listing.seller != address(0), "Listing does not exist");
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");
        
        // Return escrowed tokens
        INexusMintShariaToken token = INexusMintShariaToken(listing.tokenContract);
        token.transfer(msg.sender, listing.tokenAmount);
        
        // Deactivate listing
        _deactivateListing(listingId);
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Auto-cleanup expired listings with batch size limit
     */
    function cleanupExpiredListings(uint256[] memory listingIds) external {
        require(listingIds.length <= MAX_BATCH_SIZE, "Batch size exceeded");
        
        for (uint256 i = 0; i < listingIds.length; i++) {
            uint256 listingId = listingIds[i];
            TokenListing storage listing = listings[listingId];
            
            if (!listing.isActive) {
                emit ListingSkipped(listingId, "Not active");
                continue;
            }
            if (block.timestamp <= listing.expiresAt) {
                emit ListingSkipped(listingId, "Not expired");
                continue;
            }
            
            // Return escrowed tokens to seller
            INexusMintShariaToken token = INexusMintShariaToken(listing.tokenContract);
            token.transfer(listing.seller, listing.tokenAmount);
            
            // Deactivate listing
            _deactivateListing(listingId);
            
            emit ListingExpired(listingId);
        }
    }
    
    /**
     * @dev Cleanup single expired listing with capped reward incentive
     */
    function cleanupExpiredListing(uint256 listingId) external {
        TokenListing storage listing = listings[listingId];
        require(listing.seller != address(0), "Listing does not exist");
        require(listing.isActive, "Listing not active");
        require(block.timestamp > listing.expiresAt, "Listing not expired");
        
        // Return escrowed tokens to seller
        INexusMintShariaToken token = INexusMintShariaToken(listing.tokenContract);
        token.transfer(listing.seller, listing.tokenAmount);
        
        // Provide capped reward for cleanup (1% of accumulated fees, max 1000 AED)
        if (accumulatedFeesAED > 0) {
            uint256 reward = accumulatedFeesAED / 100;
            reward = reward > MAX_CLEANUP_REWARD_AED ? MAX_CLEANUP_REWARD_AED : reward;
            if (reward > 0) {
                accumulatedFeesAED -= reward;
                aedToken.safeTransfer(msg.sender, reward);
            }
        }
        
        // Deactivate listing
        _deactivateListing(listingId);
        
        emit ListingExpired(listingId);
    }
    
    /**
     * @dev Internal function to deactivate listing and update active array
     */
    function _deactivateListing(uint256 listingId) internal {
        listings[listingId].isActive = false;
        
        // Remove from active listings array efficiently
        uint256 indexToRemove = _activeListingIndex[listingId];
        uint256 lastIndex = _activeListingIds.length - 1;
        
        if (indexToRemove != lastIndex) {
            uint256 lastListingId = _activeListingIds[lastIndex];
            _activeListingIds[indexToRemove] = lastListingId;
            _activeListingIndex[lastListingId] = indexToRemove;
        }
        
        _activeListingIds.pop();
        delete _activeListingIndex[listingId];
    }
    
    /**
     * @dev Get active listings with pagination and filtering
     */
    function getActiveListings(uint256 from, uint256 to) external view returns (
        uint256[] memory listingIds,
        address[] memory sellers,
        address[] memory tokenContracts,
        uint256[] memory tokenAmounts,
        uint256[] memory pricesPerToken,
        uint256[] memory totalPrices,
        uint256[] memory timeRemaining,
        bool[] memory shariaApproved
    ) {
        require(from <= to, "Invalid range");
        require(_activeListingIds.length > 0, "No active listings");
        require(from < _activeListingIds.length, "Invalid from index");
        require(to < _activeListingIds.length, "Range exceeds array");
        
        uint256 length = to - from + 1;
        listingIds = new uint256[](length);
        sellers = new address[](length);
        tokenContracts = new address[](length);
        tokenAmounts = new uint256[](length);
        pricesPerToken = new uint256[](length);
        totalPrices = new uint256[](length);
        timeRemaining = new uint256[](length);
        shariaApproved = new bool[](length);
        
        uint256 validCount = 0;
        for (uint256 i = 0; i < length; i++) {
            uint256 listingId = _activeListingIds[from + i];
            TokenListing memory listing = listings[listingId];
            
            // Filter out expired listings
            if (listing.isActive && listing.expiresAt > block.timestamp) {
                listingIds[validCount] = listingId;
                sellers[validCount] = listing.seller;
                tokenContracts[validCount] = listing.tokenContract;
                tokenAmounts[validCount] = listing.tokenAmount;
                pricesPerToken[validCount] = listing.pricePerTokenAED;
                totalPrices[validCount] = listing.tokenAmount * listing.pricePerTokenAED;
                timeRemaining[validCount] = listing.expiresAt - block.timestamp;
                shariaApproved[validCount] = listing.shariaApproved;
                validCount++;
            }
        }
        
        // Resize arrays in memory to validCount to exclude expired listings
        assembly {
            mstore(listingIds, validCount) // Update array length
            mstore(sellers, validCount)
            mstore(tokenContracts, validCount)
            mstore(tokenAmounts, validCount)
            mstore(pricesPerToken, validCount)
            mstore(totalPrices, validCount)
            mstore(timeRemaining, validCount)
            mstore(shariaApproved, validCount)
        }
    }
    
    /**
     * @dev Get specific active listing details with validation
     */
    function getActiveListing(uint256 listingId) external view returns (
        address seller,
        address tokenContract,
        uint256 tokenAmount,
        uint256 pricePerTokenAED,
        uint256 totalPriceAED,
        uint256 timeRemainingSeconds,
        bool shariaApproved
    ) {
        TokenListing memory listing = listings[listingId];
        require(listing.seller != address(0), "Listing does not exist");
        require(listing.isActive, "Listing not active");
        
        return (
            listing.seller,
            listing.tokenContract,
            listing.tokenAmount,
            listing.pricePerTokenAED,
            listing.tokenAmount * listing.pricePerTokenAED,
            listing.expiresAt > block.timestamp ? listing.expiresAt - block.timestamp : 0,
            listing.shariaApproved
        );
    }
    
    /**
     * @dev Get total number of active listings
     */
    function getActiveListingCount() external view returns (uint256 count) {
        return _activeListingIds.length;
    }
    
    /**
     * @dev Authorize token contract with NexusMintShariaToken validation
     */
    function authorizeToken(address tokenContract) external onlyRole(NEXUS_ADMIN_ROLE) {
        require(tokenContract != address(0), "Invalid token contract");
        
        // Verify it's a valid NexusMintShariaToken contract
        try INexusMintShariaToken(tokenContract).propertyTokenId() returns (uint256) {
            authorizedTokenContracts[tokenContract] = true;
        } catch {
            revert("Invalid NexusMintShariaToken contract");
        }
    }
    
    /**
     * @dev Revoke token contract authorization
     */
    function revokeTokenAuthorization(address tokenContract) external onlyRole(NEXUS_ADMIN_ROLE) {
        authorizedTokenContracts[tokenContract] = false;
    }
    
    /**
     * @dev Withdraw accumulated marketplace fees with safety checks
     */
    function withdrawFees(address recipient) external onlyRole(NEXUS_ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        require(accumulatedFeesAED > 0, "No fees to withdraw");
        
        uint256 feesToWithdraw = accumulatedFeesAED;
        accumulatedFeesAED = 0; // Reset before transfer to prevent reentrancy
        
        aedToken.safeTransfer(recipient, feesToWithdraw);
        
        emit FeesWithdrawn(recipient, feesToWithdraw);
    }
    
    /**
     * @dev Get marketplace statistics
     */
    function getMarketplaceStats() external view returns (
        uint256 totalListings,
        uint256 activeListings,
        uint256 accumulatedFees
    ) {
        return (
            _listingCounter,
            _activeListingIds.length,
            accumulatedFeesAED
        );
    }
    
    /**
     * @dev Emergency function to handle stuck AED or authorized tokens only
     */
    function emergencyTokenRescue(
        address tokenContract,
        uint256 amount,
        address recipient
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(
            tokenContract == address(aedToken) || authorizedTokenContracts[tokenContract],
            "Token not authorized for rescue"
        );
        
        IERC20(tokenContract).safeTransfer(recipient, amount);
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