// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title NexusMintShariaToken
 * @dev Production-ready Sharia-compliant fractional ownership token
 * @notice Represents fractional ownership in a Sharia-certified property with profit sharing
 */
contract NexusMintShariaToken is ERC20, AccessControl, ReentrancyGuard, PullPayment {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;
    
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant SHARIA_SUPERVISOR_ROLE = keccak256("SHARIA_SUPERVISOR_ROLE");
    
    // Core property information (immutable after deployment)
    uint256 public immutable propertyTokenId;
    address public immutable propertyNFTContract;
    string public nexusPropertyId;
    string public dubaiBrokerageId;
    
    /// @dev Financial tracking structure
    struct PropertyFinancials {
        uint256 totalRentalIncomeAED;
        uint256 totalExpensesAED;
        uint256 totalDistributedAED;
        uint256 lastDistributionDate;
        uint256 currentValuationAED;
        uint256 nexusPlatformFeesAED;
        uint256 managementFeesAED;
        uint256 zakatDistributedAED;
        uint256 distributionCounter;
        uint256 remainderAED;
        uint256 pendingZakatAED;
    }
    
    /// @dev Individual investor tracking structure (optimized for storage)
    struct InvestorRecord {
        uint256 totalInvestedAED;
        uint256 totalReturnsReceivedAED;
        bool isKYCVerified;
        bool acceptsShariaTerms;
        bool isShariaCompliant;
        uint256 lastDistributionClaimed;
    }
    
    PropertyFinancials public financials;
    mapping(address => InvestorRecord) public investors;
    mapping(address => bool) public authorizedInvestors;
    
    // Enumerable set of all investors for efficient profit distribution
    EnumerableSet.AddressSet private _allInvestors;
    
    // Distribution tracking for audit trail
    mapping(uint256 => uint256) public distributionAmounts;
    mapping(uint256 => uint256) public distributionPerToken;
    
    // Separate mapping for last claim date to optimize storage
    mapping(address => uint256) public investorLastClaimDate;
    
    // Fee structure (basis points - immutable for transparency)
    uint256 public constant NEXUS_PLATFORM_FEE_BASIS_POINTS = 250;  // 2.5%
    uint256 public constant PROPERTY_MGMT_FEE_BASIS_POINTS = 100;   // 1.0%
    uint256 public constant ZAKAT_CONTRIBUTION_BASIS_POINTS = 250;  // 2.5%
    uint256 public constant MAX_TOTAL_FEE_BASIS_POINTS = 1000;      // 10.0% maximum
    
    // Payment token (AED stablecoin or USDC) - immutable after deployment
    IERC20 public immutable paymentToken;
    
    event InvestorOnboarded(address indexed investor, uint256 investmentAED, uint256 tokens, bool kycStatus, bool shariaAcceptance);
    event RentalIncomeReceived(uint256 amountAED, string source);
    event ExpenseRecorded(uint256 amountAED, string description);
    event ProfitsDistributed(uint256 indexed distributionId, uint256 totalAmountAED, uint256 perTokenAED, uint256 investorCount, uint256 nexusFeeAED, uint256 managementFeeAED, uint256 zakatAmountAED, uint256 remainderAED);
    event ZakatPaid(uint256 amountAED, address recipient, string distributionType);
    event ZakatAccrued(uint256 amountAED);
    event ComplianceUpdated(address indexed investor, bool isCompliant);
    event ProfitClaimed(address indexed investor, uint256 amountAED, uint256 distributionId);
    
    modifier onlyAuthorizedInvestor() {
        require(authorizedInvestors[msg.sender], "Not authorized investor");
        require(investors[msg.sender].isShariaCompliant, "Not Sharia compliant");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 _propertyTokenId,
        address _propertyNFTContract,
        string memory _nexusPropertyId,
        string memory _dubaiBrokerageId,
        address _paymentToken,
        uint256 initialValuationAED
    ) ERC20(name, symbol) {
        require(_propertyNFTContract != address(0), "Invalid property NFT contract");
        require(_paymentToken != address(0), "Invalid payment token");
        require(bytes(_nexusPropertyId).length > 0, "Empty nexus property ID");
        require(bytes(_dubaiBrokerageId).length > 0, "Empty brokerage ID");
        require(totalSupply > 0, "Total supply must be positive");
        require(initialValuationAED > 0, "Initial valuation must be positive");
        
        propertyTokenId = _propertyTokenId;
        propertyNFTContract = _propertyNFTContract;
        nexusPropertyId = _nexusPropertyId;
        dubaiBrokerageId = _dubaiBrokerageId;
        paymentToken = IERC20(_paymentToken);
        
        financials.currentValuationAED = initialValuationAED;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ROLE, msg.sender);
        
        _mint(msg.sender, totalSupply);
    }
    
    /**
     * @dev Onboard investor with comprehensive validation
     */
    function onboardInvestor(
        address investor,
        uint256 tokenAmount,
        uint256 investmentAED,
        bool kycStatus,
        bool shariaAcceptance
    ) external onlyRole(PLATFORM_ROLE) {
        require(investor != address(0), "Invalid investor address");
        require(tokenAmount > 0, "Token amount must be positive");
        require(investmentAED > 0, "Investment amount must be positive");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient tokens");
        
        // Validate investment aligns with property valuation
        if (totalSupply() > 0) {
            uint256 expectedInvestment = (financials.currentValuationAED * tokenAmount) / totalSupply();
            require(
                investmentAED >= expectedInvestment * 95 / 100 && 
                investmentAED <= expectedInvestment * 105 / 100, 
                "Investment misaligned with valuation"
            );
        }
        
        bool isNewInvestor = !_allInvestors.contains(investor);
        if (isNewInvestor) {
            _allInvestors.add(investor);
        }
        
        investors[investor].totalInvestedAED += investmentAED;
        investors[investor].isKYCVerified = kycStatus;
        investors[investor].acceptsShariaTerms = shariaAcceptance;
        investors[investor].lastDistributionClaimed = financials.distributionCounter;
        
        if (kycStatus && shariaAcceptance) {
            authorizedInvestors[investor] = true;
            investors[investor].isShariaCompliant = true;
        }
        
        _transfer(msg.sender, investor, tokenAmount);
        
        emit InvestorOnboarded(investor, investmentAED, tokenAmount, kycStatus, shariaAcceptance);
    }
    
    /**
     * @dev Record rental income
     */
    function recordRentalIncome(uint256 amountAED, string memory source) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(amountAED > 0, "Amount must be positive");
        require(bytes(source).length > 0, "Source description required");
        require(bytes(source).length <= 256, "Source description too long");
        
        paymentToken.safeTransferFrom(msg.sender, address(this), amountAED);
        financials.totalRentalIncomeAED += amountAED;
        
        emit RentalIncomeReceived(amountAED, source);
    }
    
    /**
     * @dev Record property expenses with optional payment
     */
    function recordExpense(uint256 amountAED, string memory description, address recipient) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(amountAED > 0, "Amount must be positive");
        require(bytes(description).length > 0, "Description required");
        require(bytes(description).length <= 256, "Description too long");
        
        financials.totalExpensesAED += amountAED;
        
        if (recipient != address(0)) {
            paymentToken.safeTransfer(recipient, amountAED);
        }
        
        emit ExpenseRecorded(amountAED, description);
    }
    
    /**
     * @dev Calculate available profit for distribution
     */
    function calculateDistributableProfit() public view returns (
        uint256 grossProfitAED,
        uint256 nexusFeeAED,
        uint256 managementFeeAED,
        uint256 zakatAmountAED,
        uint256 netDistributableAED
    ) {
        uint256 totalAvailable = financials.remainderAED;
        
        if (financials.totalRentalIncomeAED > financials.totalExpensesAED + financials.totalDistributedAED) {
            grossProfitAED = financials.totalRentalIncomeAED - financials.totalExpensesAED - financials.totalDistributedAED;
            totalAvailable += grossProfitAED;
        }
        
        if (totalAvailable == 0) {
            return (0, 0, 0, 0, 0);
        }
        
        nexusFeeAED = (totalAvailable * NEXUS_PLATFORM_FEE_BASIS_POINTS) / 10000;
        managementFeeAED = (totalAvailable * PROPERTY_MGMT_FEE_BASIS_POINTS) / 10000;
        zakatAmountAED = (totalAvailable * ZAKAT_CONTRIBUTION_BASIS_POINTS) / 10000;
        
        uint256 totalFeesAED = nexusFeeAED + managementFeeAED + zakatAmountAED;
        
        require(totalFeesAED <= (totalAvailable * MAX_TOTAL_FEE_BASIS_POINTS) / 10000, "Fees exceed maximum");
        
        netDistributableAED = totalAvailable > totalFeesAED ? totalAvailable - totalFeesAED : 0;
    }
    
    /**
     * @dev Distribute profits with enhanced zakat handling
     */
    function distributeProfits(address zakatRecipient) external onlyRole(PROPERTY_MANAGER_ROLE) nonReentrant {
        (
            uint256 grossProfit,
            uint256 nexusFee,
            uint256 managementFee,
            uint256 zakatAmount,
            uint256 netDistributable
        ) = calculateDistributableProfit();
        
        require(netDistributable > 0, "No profits to distribute");
        
        if (nexusFee > 0) {
            address nexusPlatform = getRoleMemberCount(PLATFORM_ROLE) > 0 ? 
                getRoleMember(PLATFORM_ROLE, 0) : address(this);
            paymentToken.safeTransfer(nexusPlatform, nexusFee);
            financials.nexusPlatformFeesAED += nexusFee;
        }
        
        if (managementFee > 0) {
            paymentToken.safeTransfer(msg.sender, managementFee);
            financials.managementFeesAED += managementFee;
        }
        
        if (zakatAmount > 0) {
            if (zakatRecipient != address(0)) {
                paymentToken.safeTransfer(zakatRecipient, zakatAmount);
                financials.zakatDistributedAED += zakatAmount;
                emit ZakatPaid(zakatAmount, zakatRecipient, "immediate");
            } else {
                financials.pendingZakatAED += zakatAmount;
                emit ZakatAccrued(zakatAmount);
            }
        }
        
        uint256 platformHoldings = getRoleMemberCount(PLATFORM_ROLE) > 0 ?
            balanceOf(getRoleMember(PLATFORM_ROLE, 0)) : 0;
        uint256 tokensInCirculation = totalSupply() - platformHoldings;
        require(tokensInCirculation > 0, "No tokens in circulation");
        
        uint256 perTokenAED = netDistributable / tokensInCirculation;
        require(perTokenAED > 0, "Amount too small to distribute");
        
        uint256 distributedAmount = perTokenAED * tokensInCirculation;
        uint256 newRemainder = netDistributable - distributedAmount;
        
        financials.distributionCounter++;
        uint256 currentDistributionId = financials.distributionCounter;
        
        distributionAmounts[currentDistributionId] = distributedAmount;
        distributionPerToken[currentDistributionId] = perTokenAED;
        
        uint256 investorCount = _allInvestors.length();
        for (uint256 i = 0; i < investorCount; i++) {
            address investor = _allInvestors.at(i);
            uint256 investorBalance = balanceOf(investor);
            
            if (investorBalance > 0 && investors[investor].isShariaCompliant) {
                uint256 investorShare = perTokenAED * investorBalance;
                _asyncTransfer(investor, investorShare);
            }
        }
        
        financials.totalDistributedAED += (distributedAmount + nexusFee + managementFee + zakatAmount);
        financials.remainderAED = newRemainder;
        financials.lastDistributionDate = block.timestamp;
        
        emit ProfitsDistributed(currentDistributionId, distributedAmount, perTokenAED, investorCount, nexusFee, managementFee, zakatAmount, newRemainder);
    }
    
    /**
     * @dev Distribute accrued zakat with proper accounting
     */
    function distributeAccruedZakat(address recipient) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        require(financials.pendingZakatAED > 0, "No zakat to distribute");
        
        uint256 zakatAmount = financials.pendingZakatAED;
        financials.pendingZakatAED = 0;
        financials.zakatDistributedAED += zakatAmount;
        financials.totalDistributedAED += zakatAmount;
        
        paymentToken.safeTransfer(recipient, zakatAmount);
        emit ZakatPaid(zakatAmount, recipient, "accrued");
    }
    
    /**
     * @dev Investor claims profit share
     */
    function claimProfitShare() external onlyAuthorizedInvestor nonReentrant {
        uint256 claimableAmount = payments(msg.sender);
        require(claimableAmount > 0, "No returns available");
        
        investors[msg.sender].totalReturnsReceivedAED += claimableAmount;
        investorLastClaimDate[msg.sender] = block.timestamp;
        investors[msg.sender].lastDistributionClaimed = financials.distributionCounter;
        
        withdrawPayments(payable(msg.sender));
        
        emit ProfitClaimed(msg.sender, claimableAmount, financials.distributionCounter);
    }
    
    /**
     * @dev Update property valuation
     */
    function updateValuation(uint256 newValuationAED) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(newValuationAED > 0, "Valuation must be positive");
        financials.currentValuationAED = newValuationAED;
    }
    
    /**
     * @dev Update investor compliance
     */
    function updateInvestorCompliance(address investor, bool isCompliant) external onlyRole(SHARIA_SUPERVISOR_ROLE) {
        require(investor != address(0), "Invalid investor address");
        require(_allInvestors.contains(investor), "Investor not found");
        
        investors[investor].isShariaCompliant = isCompliant;
        authorizedInvestors[investor] = isCompliant;
        emit ComplianceUpdated(investor, isCompliant);
    }
    
    /**
     * @dev Get investor dashboard data
     */
    function getInvestorDashboard(address investor) external view returns (
        uint256 tokenBalance,
        uint256 ownershipPercentageBasisPoints,
        uint256 totalInvestedAED,
        uint256 totalReturnsAED,
        uint256 currentValueAED,
        uint256 pendingReturnsAED,
        bool isCompliant
    ) {
        tokenBalance = balanceOf(investor);
        ownershipPercentageBasisPoints = totalSupply() > 0 ? (tokenBalance * 10000) / totalSupply() : 0;
        totalInvestedAED = investors[investor].totalInvestedAED;
        totalReturnsAED = investors[investor].totalReturnsReceivedAED;
        currentValueAED = totalSupply() > 0 ? (financials.currentValuationAED * tokenBalance) / totalSupply() : 0;
        pendingReturnsAED = payments(investor);
        isCompliant = investors[investor].isShariaCompliant;
    }
    
    /**
     * @dev Get property financial summary
     */
    function getPropertySummary() external view returns (
        uint256 totalRentalAED,
        uint256 totalExpensesAED,
        uint256 totalDistributedAED,
        uint256 currentValuationAED,
        uint256 nexusFeesCollectedAED,
        uint256 zakatPaidAED,
        uint256 lastDistributionDate,
        uint256 remainderAED,
        uint256 pendingZakatAED
    ) {
        return (
            financials.totalRentalIncomeAED,
            financials.totalExpensesAED,
            financials.totalDistributedAED,
            financials.currentValuationAED,
            financials.nexusPlatformFeesAED,
            financials.zakatDistributedAED,
            financials.lastDistributionDate,
            financials.remainderAED,
            financials.pendingZakatAED
        );
    }
    
    /**
     * @dev Override transfers with Sharia compliance validation
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (from != address(0) && to != address(0)) {
            require(authorizedInvestors[from], "Sender not authorized");
            require(authorizedInvestors[to], "Recipient not authorized");
            require(investors[from].isShariaCompliant, "Sender not Sharia compliant");
            require(investors[to].isShariaCompliant, "Recipient not Sharia compliant");
            require(investors[to].isKYCVerified, "Recipient not onboarded");
            
            if (!_allInvestors.contains(to)) {
                _allInvestors.add(to);
            }
            
            if (balanceOf(from) == amount && from != (getRoleMemberCount(PLATFORM_ROLE) > 0 ? getRoleMember(PLATFORM_ROLE, 0) : address(0))) {
                _allInvestors.remove(from);
            }
        }
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Get pending profit for investor
     */
    function getPendingProfit(address investor) external view returns (uint256 pendingAmount) {
        return payments(investor);
    }
    
    /**
     * @dev Get total number of investors
     */
    function getInvestorCount() external view returns (uint256 count) {
        return _allInvestors.length();
    }
    
    /**
     * @dev Get investor by index
     */
    function getInvestorAt(uint256 index) external view returns (address investor) {
        require(index < _allInvestors.length(), "Index out of bounds");
        return _allInvestors.at(index);
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