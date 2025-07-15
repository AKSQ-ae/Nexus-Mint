// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../NexusMintShariaPropertyToken.sol";
import "../NexusMintShariaMarketplace.sol";
import "../NexusMintShariaFactory.sol";

// Mock ERC20 for testing
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockAED is ERC20 {
    constructor() ERC20("UAE Dirham Token", "AED") {
        _mint(msg.sender, 1_000_000_000 * 10**18); // 1B AED
    }
}

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address shariaBoard = vm.envAddress("SHARIA_BOARD_ADDRESS");
        
        console.log("Deploying with:");
        console.log("Deployer:", deployer);
        console.log("Sharia Board:", shariaBoard);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy AED Token
        MockAED aedToken = new MockAED();
        console.log("AED Token:", address(aedToken));
        
        // 2. Deploy Property Registry
        NexusMintShariaPropertyToken propertyRegistry = new NexusMintShariaPropertyToken();
        console.log("Property Registry:", address(propertyRegistry));
        
        // 3. Deploy Marketplace
        NexusMintShariaMarketplace marketplace = new NexusMintShariaMarketplace(address(aedToken));
        console.log("Marketplace:", address(marketplace));
        
        // 4. Deploy Factory
        NexusMintShariaFactory factory = new NexusMintShariaFactory(
            address(aedToken),
            shariaBoard
        );
        console.log("Factory:", address(factory));
        
        // 5. Setup permissions
        propertyRegistry.addRoleMember(propertyRegistry.NEXUS_ADMIN_ROLE(), address(factory));
        marketplace.addRoleMember(marketplace.NEXUS_ADMIN_ROLE(), address(factory));
        
        // 6. Fund test accounts
        aedToken.transfer(shariaBoard, 100_000 * 10**18);
        
        vm.stopBroadcast();
        
        console.log("Deployment completed successfully!");
    }
}