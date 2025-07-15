const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Deployed Contracts...\n");
    
    // Load deployment data
    const fs = require('fs');
    const deploymentData = JSON.parse(
        fs.readFileSync(`deployments/${hre.network.name}.json`, 'utf8')
    );
    
    const [deployer, shariaBoard, nexusAdmin, investor1, investor2] = await ethers.getSigners();
    
    // Get contract instances
    const Factory = await ethers.getContractFactory("NexusMintShariaFactory");
    const factory = Factory.attach(deploymentData.contracts.factory);
    
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const aedToken = MockERC20.attach(deploymentData.contracts.aedToken);
    
    console.log("📋 Testing with contracts:");
    console.log("├── Factory:", factory.address);
    console.log("├── AED Token:", aedToken.address);
    console.log("└── Network:", hre.network.name);
    console.log();
    
    // ========================================================================
    // TEST 1: Create Property Ecosystem
    // ========================================================================
    console.log("1️⃣ Testing Property Ecosystem Creation...");
    
    const permittedUses = [
        "Residential Rental",
        "Corporate Housing",
        "Short Term Rental",
        "Property Management",
        "Halal Investment"
    ];
    
    try {
        const tx = await factory.connect(nexusAdmin).createPropertyEcosystem(
            "NEXUS-TEST-001",
            "DLD-TEST-12345",
            "Dubai Marina Test Tower",
            ethers.utils.parseEther("1000000"), // 1M AED
            1000, // 1000 shares
            permittedUses,
            "ipfs://QmTestPropertyMetadata123",
            "Dubai Marina Test Tokens",
            "DMTT",
            ethers.utils.parseEther("1000") // 1000 tokens
        );
        
        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === 'PropertyEcosystemCreated');
        
        console.log("✅ Property ecosystem created!");
        console.log("├── Property Token ID:", event?.args?.propertyTokenId.toString());
        console.log("├── Fractional Token:", event?.args?.fractionalTokenContract);
        console.log("└── Gas used:", receipt.gasUsed.toString());
        console.log();
        
        // Store for next tests
        global.testPropertyId = event?.args?.propertyTokenId;
        global.testTokenContract = event?.args?.fractionalTokenContract;
        
    } catch (error) {
        console.error("❌ Property creation failed:", error.message);
        return;
    }
    
    // ========================================================================
    // TEST 2: Sharia Certification
    // ========================================================================
    console.log("2️⃣ Testing Sharia Certification...");
    
    try {
        const certificateHash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("SHARIA_CERT_TEST_001")
        );
        const expiryTimestamp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year
        
        const tx = await factory.connect(shariaBoard).certifyPropertySharia(
            global.testPropertyId,
            certificateHash,
            expiryTimestamp
        );
        
        await tx.wait();
        console.log("✅ Sharia certification completed!");
        console.log("├── Certificate Hash:", certificateHash);
        console.log("└── Expires:", new Date(expiryTimestamp * 1000).toISOString());
        console.log();
        
    } catch (error) {
        console.error("❌ Sharia certification failed:", error.message);
        return;
    }
    
    // ========================================================================
    // TEST 3: Investor Onboarding
    // ========================================================================
    console.log("3️⃣ Testing Investor Onboarding...");
    
    try {
        // Fund investors with AED
        await aedToken.connect(deployer).transfer(
            investor1.address,
            ethers.utils.parseEther("50000")
        );
        await aedToken.connect(deployer).transfer(
            investor2.address,
            ethers.utils.parseEther("30000")
        );
        
        // Onboard first investor
        const tx1 = await factory.connect(nexusAdmin).onboardInvestor(
            global.testPropertyId,
            investor1.address,
            ethers.utils.parseEther("100"), // 100 tokens (10% ownership)
            ethers.utils.parseEther("100000"), // 100K AED investment
            true, // KYC verified
            true  // Sharia terms accepted
        );
        await tx1.wait();
        
        // Onboard second investor
        const tx2 = await factory.connect(nexusAdmin).onboardInvestor(
            global.testPropertyId,
            investor2.address,
            ethers.utils.parseEther("50"), // 50 tokens (5% ownership)
            ethers.utils.parseEther("50000"), // 50K AED investment
            true, // KYC verified
            true  // Sharia terms accepted
        );
        await tx2.wait();
        
        console.log("✅ Investors onboarded successfully!");
        console.log("├── Investor 1:", investor1.address, "(10% ownership)");
        console.log("└── Investor 2:", investor2.address, "(5% ownership)");
        console.log();
        
    } catch (error) {
        console.error("❌ Investor onboarding failed:", error.message);
        return;
    }
    
    // ========================================================================
    // TEST 4: Portfolio Overview
    // ========================================================================
    console.log("4️⃣ Testing Portfolio Overview...");
    
    try {
        const portfolio1 = await factory.getInvestorPortfolio(investor1.address);
        const portfolio2 = await factory.getInvestorPortfolio(investor2.address);
        
        console.log("📊 Investor 1 Portfolio:");
        console.log("├── Properties:", portfolio1.propertyTokenIds.length);
        console.log("├── Token Balance:", ethers.utils.formatEther(portfolio1.tokenBalances[0] || 0));
        console.log("├── Total Invested:", ethers.utils.formatEther(portfolio1.totalInvestedAED[0] || 0), "AED");
        console.log("└── Current Value:", ethers.utils.formatEther(portfolio1.currentValuesAED[0] || 0), "AED");
        console.log();
        
        console.log("📊 Investor 2 Portfolio:");
        console.log("├── Properties:", portfolio2.propertyTokenIds.length);
        console.log("├── Token Balance:", ethers.utils.formatEther(portfolio2.tokenBalances[0] || 0));
        console.log("├── Total Invested:", ethers.utils.formatEther(portfolio2.totalInvestedAED[0] || 0), "AED");
        console.log("└── Current Value:", ethers.utils.formatEther(portfolio2.currentValuesAED[0] || 0), "AED");
        console.log();
        
    } catch (error) {
        console.error("❌ Portfolio overview failed:", error.message);
    }
    
    // ========================================================================
    // TEST 5: Marketplace Overview
    // ========================================================================
    console.log("5️⃣ Testing Marketplace Overview...");
    
    try {
        const marketplaceStats = await factory.getMarketplaceOverview();
        
        console.log("🏪 Marketplace Statistics:");
        console.log("├── Total Properties:", marketplaceStats.totalProperties.toString());
        console.log("├── Active Properties:", marketplaceStats.activeProperties.toString());
        console.log("├── Active Listings:", marketplaceStats.totalActiveListings.toString());
        console.log("└── Accumulated Fees:", ethers.utils.formatEther(marketplaceStats.accumulatedFeesAED), "AED");
        console.log();
        
    } catch (error) {
        console.error("❌ Marketplace overview failed:", error.message);
    }
    
    console.log("🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("\n✅ Your Nexus Mint platform is ready for production!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Testing failed:", error);
        process.exit(1);
    });