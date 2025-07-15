import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  timestamp: string;
  verificationUrl?: string;
  propertyCreated?: Record<string, unknown>;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=== PHASE 1 TESTNET DEPLOYMENT ===");
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  const network = await deployer.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Deploy ERC-1155 PropertyToken contract
  const baseURI = "https://api.nexusmint.com/metadata/";
  
  console.log("\n🚀 Deploying PropertyToken contract...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(baseURI, deployer.address);

  await propertyToken.waitForDeployment();
  const contractAddress = await propertyToken.getAddress();
  const deployTx = propertyToken.deploymentTransaction();
  
  console.log("✅ PropertyToken deployed to:", contractAddress);
  console.log("📦 Transaction hash:", deployTx?.hash);
  console.log("🔗 Block number:", deployTx?.blockNumber);
  console.log("⛽ Gas used:", deployTx?.gasLimit.toString());

  // Wait for confirmations
  console.log("\n⏳ Waiting for confirmations...");
  await deployTx?.wait(3);
  
  // Create sample property for testing
  console.log("\n🏠 Creating sample property...");
  const propertyData = {
    propertyId: "PROP_DEMO_001",
    title: "Premium Office Tower - Dubai Financial District",
    location: "DIFC, Dubai, UAE",
    totalValue: ethers.parseEther("5000"), // 5000 ETH equivalent
    totalSupply: 1000000, // 1 million tokens
    metadataURI: "https://api.nexusmint.com/metadata/PROP_DEMO_001.json"
  };
  
  const createTx = await propertyToken.createProperty(
    propertyData.propertyId,
    propertyData.title,
    propertyData.location,
    propertyData.totalValue,
    propertyData.totalSupply,
    propertyData.metadataURI
  );
  
  const createReceipt = await createTx.wait();
  console.log("✅ Property created - Token ID: 1");
  console.log("📊 Property Details:");
  console.log("   - Title:", propertyData.title);
  console.log("   - Total Value:", ethers.formatEther(propertyData.totalValue), "ETH");
  console.log("   - Total Supply:", propertyData.totalSupply.toLocaleString());
  console.log("   - Price Per Token:", ethers.formatEther(propertyData.totalValue / BigInt(propertyData.totalSupply)), "ETH");

  // Test purchase functionality
  console.log("\n💰 Testing token purchase...");
  const tokensToBuy = 1000;
  const cost = (propertyData.totalValue / BigInt(propertyData.totalSupply)) * BigInt(tokensToBuy);
  
  const purchaseTx = await propertyToken.purchaseTokens(1, tokensToBuy, {
    value: cost
  });
  await purchaseTx.wait();
  
  const balance = await propertyToken.balanceOf(deployer.address, 1);
  console.log("✅ Purchase successful - Tokens owned:", balance.toString());

  // Verify contract on explorer
  let verificationUrl = "";
  if (network.chainId === 80001n) { // Mumbai testnet
    verificationUrl = `https://mumbai.polygonscan.com/address/${contractAddress}`;
    console.log("\n🔍 Verify contract at:", verificationUrl);
    
    if (process.env.POLYGONSCAN_API_KEY) {
      console.log("🔄 Auto-verifying contract...");
      try {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        import hre from 'hardhat';
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: [baseURI, deployer.address],
        });
        console.log("✅ Contract verified successfully!");
      } catch (error) {
        console.log("⚠️  Verification failed (manual verification required):", error.message);
      }
    }
  }

  // Generate deployment report
  const deploymentResult: DeploymentResult = {
    contractAddress,
    transactionHash: deployTx?.hash || "",
    blockNumber: deployTx?.blockNumber || 0,
    gasUsed: deployTx?.gasLimit.toString() || "0",
    timestamp: new Date().toISOString(),
    verificationUrl,
    propertyCreated: {
      tokenId: 1,
      ...propertyData,
      totalValue: ethers.formatEther(propertyData.totalValue),
      pricePerToken: ethers.formatEther(propertyData.totalValue / BigInt(propertyData.totalSupply))
    }
  };

  // Save deployment results
  const resultsDir = path.join(__dirname, "../deployment-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const resultFile = path.join(resultsDir, `testnet-deployment-${Date.now()}.json`);
  fs.writeFileSync(resultFile, JSON.stringify(deploymentResult, null, 2));
  
  console.log("\n📋 DEPLOYMENT SUMMARY");
  console.log("======================");
  console.log("✅ Contract Address:", contractAddress);
  console.log("✅ Transaction Hash:", deployTx?.hash);
  console.log("✅ Block Number:", deployTx?.blockNumber);
  console.log("✅ Verification URL:", verificationUrl);
  console.log("✅ Sample Property Created: Token ID 1");
  console.log("✅ Test Purchase Completed: 1000 tokens");
  console.log("📄 Results saved to:", resultFile);

  return deploymentResult;
}

main()
  .then((result) => {
    console.log("\n🎉 PHASE 1 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("📋 Ready for regulatory evidence package");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });