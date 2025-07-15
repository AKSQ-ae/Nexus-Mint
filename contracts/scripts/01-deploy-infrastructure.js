const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting Nexus Mint Sharia Contract Deployment...\n");
    
    const [deployer, shariaBoard, nexusAdmin] = await ethers.getSigners();
    
    console.log("📋 Deployment Configuration:");
    console.log("├── Deployer:", deployer.address);
    console.log("├── Sharia Board:", shariaBoard.address);
    console.log("└── Nexus Admin:", nexusAdmin.address);
    console.log();
    
    // Get initial balances
    const deployerBalance = await deployer.getBalance();
    console.log("💰 Deployer balance:", ethers.utils.formatEther(deployerBalance), "ETH\n");
    
    const deploymentResults = {};
    
    // ========================================================================
    // STEP 1: Deploy AED Token (Mock for testing)
    // ========================================================================
    console.log("1️⃣ Deploying Mock AED Token...");
    
    const MockERC20 = await ethers.getContractFactory("MockERC20", deployer);
    const aedToken = await MockERC20.deploy(
        "UAE Dirham Token",
        "AED",
        18,
        ethers.utils.parseEther("1000000000") // 1B AED supply
    );
    await aedToken.deployed();
    
    deploymentResults.aedToken = aedToken.address;
    console.log("✅ AED Token deployed to:", aedToken.address);
    console.log();
    
    // ========================================================================
    // STEP 2: Deploy Property NFT Registry
    // ========================================================================
    console.log("2️⃣ Deploying Property NFT Registry...");
    
    const PropertyToken = await ethers.getContractFactory("NexusMintShariaPropertyToken", deployer);
    const propertyRegistry = await PropertyToken.deploy();
    await propertyRegistry.deployed();
    
    deploymentResults.propertyRegistry = propertyRegistry.address;
    console.log("✅ Property Registry deployed to:", propertyRegistry.address);
    
    // Setup roles for Property Registry
    console.log("⚙️ Setting up Property Registry roles...");
    await propertyRegistry.connect(deployer).addRoleMember(
        await propertyRegistry.NEXUS_ADMIN_ROLE(),
        nexusAdmin.address
    );
    await propertyRegistry.connect(deployer).addRoleMember(
        await propertyRegistry.SHARIA_BOARD_ROLE(),
        shariaBoard.address
    );
    console.log("✅ Property Registry roles configured");
    console.log();
    
    // ========================================================================
    // STEP 3: Deploy Marketplace
    // ========================================================================
    console.log("3️⃣ Deploying Sharia Marketplace...");
    
    const Marketplace = await ethers.getContractFactory("NexusMintShariaMarketplace", deployer);
    const marketplace = await Marketplace.deploy(aedToken.address);
    await marketplace.deployed();
    
    deploymentResults.marketplace = marketplace.address;
    console.log("✅ Marketplace deployed to:", marketplace.address);
    
    // Setup roles for Marketplace
    console.log("⚙️ Setting up Marketplace roles...");
    await marketplace.connect(deployer).addRoleMember(
        await marketplace.NEXUS_ADMIN_ROLE(),
        nexusAdmin.address
    );
    await marketplace.connect(deployer).addRoleMember(
        await marketplace.SHARIA_SUPERVISOR_ROLE(),
        shariaBoard.address
    );
    console.log("✅ Marketplace roles configured");
    console.log();
    
    // ========================================================================
    // STEP 4: Deploy Factory (Main Controller)
    // ========================================================================
    console.log("4️⃣ Deploying Nexus Factory (Main Controller)...");
    
    const Factory = await ethers.getContractFactory("NexusMintShariaFactory", deployer);
    const factory = await Factory.deploy(
        aedToken.address,
        shariaBoard.address
    );
    await factory.deployed();
    
    deploymentResults.factory = factory.address;
    console.log("✅ Factory deployed to:", factory.address);
    console.log();
    
    // ========================================================================
    // STEP 5: Configure Cross-Contract Permissions
    // ========================================================================
    console.log("5️⃣ Configuring cross-contract permissions...");
    
    // Grant Factory admin rights on Property Registry
    await propertyRegistry.connect(deployer).addRoleMember(
        await propertyRegistry.NEXUS_ADMIN_ROLE(),
        factory.address
    );
    
    // Grant Factory admin rights on Marketplace
    await marketplace.connect(deployer).addRoleMember(
        await marketplace.NEXUS_ADMIN_ROLE(),
        factory.address
    );
    
    console.log("✅ Cross-contract permissions configured");
    console.log();
    
    // ========================================================================
    // STEP 6: Fund Test Accounts
    // ========================================================================
    console.log("6️⃣ Funding test accounts with AED tokens...");
    
    const fundingAmount = ethers.utils.parseEther("100000"); // 100K AED each
    const testAccounts = [deployer, shariaBoard, nexusAdmin];
    
    for (const account of testAccounts) {
        await aedToken.connect(deployer).transfer(account.address, fundingAmount);
        console.log(`💰 Funded ${account.address} with 100K AED`);
    }
    console.log();
    
    // ========================================================================
    // DEPLOYMENT SUMMARY
    // ========================================================================
    console.log("🎉 DEPLOYMENT COMPLETE!\n");
    console.log("📋 Contract Addresses:");
    console.log("├── AED Token:", deploymentResults.aedToken);
    console.log("├── Property Registry:", deploymentResults.propertyRegistry);
    console.log("├── Marketplace:", deploymentResults.marketplace);
    console.log("└── Factory (Main):", deploymentResults.factory);
    console.log();
    
    console.log("🔧 Configuration:");
    console.log("├── Sharia Board:", shariaBoard.address);
    console.log("├── Nexus Admin:", nexusAdmin.address);
    console.log("└── Deployer:", deployer.address);
    console.log();
    
    // Save deployment addresses
    const fs = require('fs');
    const deploymentData = {
        network: hre.network.name,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        shariaBoard: shariaBoard.address,
        nexusAdmin: nexusAdmin.address,
        contracts: deploymentResults
    };
    
    const deploymentsDir = 'deployments';
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    
    fs.writeFileSync(
        `deployments/${hre.network.name}.json`,
        JSON.stringify(deploymentData, null, 2)
    );
    
    console.log(`💾 Deployment data saved to deployments/${hre.network.name}.json`);
    
    // Calculate gas costs
    const finalBalance = await deployer.getBalance();
    const gasUsed = deployerBalance.sub(finalBalance);
    console.log("⛽ Total gas cost:", ethers.utils.formatEther(gasUsed), "ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });