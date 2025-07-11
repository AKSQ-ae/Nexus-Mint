import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Example property data
  const propertyData = {
    name: "Dubai Marina Apartment Token",
    symbol: "DMAT",
    propertyId: "prop_001",
    title: "Luxury Apartment in Dubai Marina",
    location: "Dubai Marina, UAE",
    totalValue: ethers.parseEther("1000"), // 1000 ETH equivalent
    totalSupply: ethers.parseUnits("1000000", 18), // 1 million tokens
    metadataURI: "https://example.com/metadata/prop_001.json",
    owner: deployer.address
  };

  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(
    propertyData.name,
    propertyData.symbol,
    propertyData.propertyId,
    propertyData.title,
    propertyData.location,
    propertyData.totalValue,
    propertyData.totalSupply,
    propertyData.metadataURI,
    propertyData.owner
  );

  await propertyToken.waitForDeployment();
  const contractAddress = await propertyToken.getAddress();

  console.log("PropertyToken deployed to:", contractAddress);
  console.log("Property Info:");
  console.log("- Name:", propertyData.name);
  console.log("- Symbol:", propertyData.symbol);
  console.log("- Total Value:", ethers.formatEther(propertyData.totalValue), "ETH");
  console.log("- Total Supply:", ethers.formatUnits(propertyData.totalSupply, 18));
  console.log("- Price Per Token:", ethers.formatEther(propertyData.totalValue.toBigInt() / propertyData.totalSupply.toBigInt()), "ETH");

  // Verify contract on Etherscan (if not on local network)
  if (process.env.ETHERSCAN_API_KEY && deployer.provider._network.chainId !== 1337) {
    console.log("Waiting for block confirmations...");
    await propertyToken.deploymentTransaction()?.wait(6);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          propertyData.name,
          propertyData.symbol,
          propertyData.propertyId,
          propertyData.title,
          propertyData.location,
          propertyData.totalValue,
          propertyData.totalSupply,
          propertyData.metadataURI,
          propertyData.owner
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