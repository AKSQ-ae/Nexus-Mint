import { Contract, ethers } from 'ethers';

// Factory Contract ABI (key methods only)
const FACTORY_ABI = [
  "function createPropertyEcosystem(string,string,string,uint256,uint256,string[5],string,string,string,uint256) external returns (uint256,address)",
  "function certifyPropertySharia(uint256,bytes32,uint256) external",
  "function onboardInvestor(uint256,address,uint256,uint256,bool,bool) external",
  "function getPropertyEcosystem(uint256) external view returns (string,uint256,bool,bool,uint256,address,string,string,uint256,uint256,uint256,uint256,uint256)",
  "function getInvestorPortfolio(address) external view returns (uint256[],uint256[],uint256[],uint256[],uint256[])",
  "function getMarketplaceOverview() external view returns (uint256,uint256,uint256,uint256)",
  "function getAllProperties() external view returns (uint256[])",
  "function getPropertyCount() external view returns (uint256)"
];

export interface PropertyEcosystem {
  nexusId: string;
  valueAED: bigint;
  isShariaCompliant: boolean;
  isActive: boolean;
  certificationExpiry: bigint;
  fractionalTokenContract: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: bigint;
  investorCount: bigint;
  totalRentalAED: bigint;
  totalDistributedAED: bigint;
  currentValuationAED: bigint;
}

export interface InvestorPortfolio {
  propertyTokenIds: bigint[];
  tokenBalances: bigint[];
  totalInvestedAED: bigint[];
  currentValuesAED: bigint[];
  pendingReturnsAED: bigint[];
}

export interface MarketplaceOverview {
  totalProperties: bigint;
  activeProperties: bigint;
  totalActiveListings: bigint;
  accumulatedFeesAED: bigint;
}

export class NexusMintShariaService {
  private contract: Contract;
  private signer: ethers.Signer;

  constructor(factoryAddress: string, signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new Contract(factoryAddress, FACTORY_ABI, signer);
  }

  /**
   * Create complete property ecosystem in one transaction
   */
  async createPropertyEcosystem({
    nexusPropertyId,
    dubaiBrokerageId,
    propertyAddress,
    propertyValueAED,
    totalShares,
    permittedUses,
    metadataURI,
    tokenName,
    tokenSymbol,
    totalSupply
  }: {
    nexusPropertyId: string;
    dubaiBrokerageId: string;
    propertyAddress: string;
    propertyValueAED: bigint;
    totalShares: bigint;
    permittedUses: [string, string, string, string, string];
    metadataURI: string;
    tokenName: string;
    tokenSymbol: string;
    totalSupply: bigint;
  }): Promise<{ propertyTokenId: bigint; fractionalTokenContract: string }> {
    try {
      const tx = await this.contract.createPropertyEcosystem(
        nexusPropertyId,
        dubaiBrokerageId,
        propertyAddress,
        propertyValueAED,
        totalShares,
        permittedUses,
        metadataURI,
        tokenName,
        tokenSymbol,
        totalSupply
      );

      const receipt = await tx.wait();
      
      // Parse the PropertyEcosystemCreated event
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id("PropertyEcosystemCreated(uint256,address,string,string,string,uint256,uint256)")
      );

      if (event) {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256", "address", "string", "string", "string", "uint256", "uint256"],
          event.data
        );
        return {
          propertyTokenId: decoded[0],
          fractionalTokenContract: decoded[1]
        };
      }

      throw new Error("Property ecosystem creation event not found");
    } catch (error) {
      console.error("Error creating property ecosystem:", error);
      throw error;
    }
  }

  /**
   * Complete Sharia certification for property
   */
  async certifyPropertySharia(
    propertyTokenId: bigint,
    certificateHash: string,
    expiryTimestamp: bigint
  ): Promise<void> {
    try {
      const tx = await this.contract.certifyPropertySharia(
        propertyTokenId,
        certificateHash,
        expiryTimestamp
      );
      await tx.wait();
    } catch (error) {
      console.error("Error certifying property Sharia:", error);
      throw error;
    }
  }

  /**
   * Onboard investor to property ecosystem
   */
  async onboardInvestor({
    propertyTokenId,
    investor,
    tokenAmount,
    investmentAED,
    kycStatus,
    shariaAcceptance
  }: {
    propertyTokenId: bigint;
    investor: string;
    tokenAmount: bigint;
    investmentAED: bigint;
    kycStatus: boolean;
    shariaAcceptance: boolean;
  }): Promise<void> {
    try {
      const tx = await this.contract.onboardInvestor(
        propertyTokenId,
        investor,
        tokenAmount,
        investmentAED,
        kycStatus,
        shariaAcceptance
      );
      await tx.wait();
    } catch (error) {
      console.error("Error onboarding investor:", error);
      throw error;
    }
  }

  /**
   * Get complete property ecosystem information
   */
  async getPropertyEcosystem(propertyTokenId: bigint): Promise<PropertyEcosystem> {
    try {
      const result = await this.contract.getPropertyEcosystem(propertyTokenId);
      
      return {
        nexusId: result[0],
        valueAED: result[1],
        isShariaCompliant: result[2],
        isActive: result[3],
        certificationExpiry: result[4],
        fractionalTokenContract: result[5],
        tokenName: result[6],
        tokenSymbol: result[7],
        totalSupply: result[8],
        investorCount: result[9],
        totalRentalAED: result[10],
        totalDistributedAED: result[11],
        currentValuationAED: result[12]
      };
    } catch (error) {
      console.error("Error getting property ecosystem:", error);
      throw error;
    }
  }

  /**
   * Get investor portfolio across all properties
   */
  async getInvestorPortfolio(investorAddress: string): Promise<InvestorPortfolio> {
    try {
      const result = await this.contract.getInvestorPortfolio(investorAddress);
      
      return {
        propertyTokenIds: result[0],
        tokenBalances: result[1],
        totalInvestedAED: result[2],
        currentValuesAED: result[3],
        pendingReturnsAED: result[4]
      };
    } catch (error) {
      console.error("Error getting investor portfolio:", error);
      throw error;
    }
  }

  /**
   * Get marketplace overview statistics
   */
  async getMarketplaceOverview(): Promise<MarketplaceOverview> {
    try {
      const result = await this.contract.getMarketplaceOverview();
      
      return {
        totalProperties: result[0],
        activeProperties: result[1],
        totalActiveListings: result[2],
        accumulatedFeesAED: result[3]
      };
    } catch (error) {
      console.error("Error getting marketplace overview:", error);
      throw error;
    }
  }

  /**
   * Get all deployed properties
   */
  async getAllProperties(): Promise<bigint[]> {
    try {
      return await this.contract.getAllProperties();
    } catch (error) {
      console.error("Error getting all properties:", error);
      throw error;
    }
  }

  /**
   * Get total property count
   */
  async getPropertyCount(): Promise<bigint> {
    try {
      return await this.contract.getPropertyCount();
    } catch (error) {
      console.error("Error getting property count:", error);
      throw error;
    }
  }

  /**
   * Format AED amount for display
   */
  static formatAED(amount: bigint): string {
    return `${ethers.formatEther(amount)} AED`;
  }

  /**
   * Parse AED amount from string
   */
  static parseAED(amount: string): bigint {
    return ethers.parseEther(amount);
  }
}