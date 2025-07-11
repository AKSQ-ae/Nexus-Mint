import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy ERC-1155 PropertyToken contract
  const baseURI = "https://example.com/metadata/";
  
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(
    baseURI,
    deployer.address
  );

  await propertyToken.waitForDeployment();
  const contractAddress = await propertyToken.getAddress();

  console.log("PropertyToken ERC-1155 deployed to:", contractAddress);
  console.log("Base URI:", baseURI);
  
  // Create first property as example
  const propertyData = {
    propertyId: "prop_001",
    title: "Luxury Apartment in Dubai Marina",
    location: "Dubai Marina, UAE",
    totalValue: ethers.parseEther("1000"), // 1000 ETH equivalent
    totalSupply: 1000000, // 1 million tokens
    metadataURI: "https://example.com/metadata/prop_001.json"
  };
  
  console.log("Creating first property...");
  const createTx = await propertyToken.createProperty(
    propertyData.propertyId,
    propertyData.title,
    propertyData.location,
    propertyData.totalValue,
    propertyData.totalSupply,
    propertyData.metadataURI
  );
  await createTx.wait();
  
  console.log("Property Created:");
  console.log("- Token ID: 1");
  console.log("- Title:", propertyData.title);
  console.log("- Total Value:", ethers.formatEther(propertyData.totalValue), "ETH");
  console.log("- Total Supply:", propertyData.totalSupply);
  console.log("- Price Per Token:", ethers.formatEther(propertyData.totalValue / BigInt(propertyData.totalSupply)), "ETH");

  // Verify contract on Etherscan (if not on local network)
  if (process.env.ETHERSCAN_API_KEY && deployer.provider._network.chainId !== 1337) {
    console.log("Waiting for block confirmations...");
    await propertyToken.deploymentTransaction()?.wait(6);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          baseURI,
          deployer.address
        ],
      });
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  return {
    contractAddress,
    propertyToken,
    propertyData
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });