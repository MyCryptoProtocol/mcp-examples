import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { NFTMarketAgent } from 'mcp-agents/src/agents/nft-market-agent';
import { ContextRouter } from 'mcp-agents/src/context-router';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This example demonstrates how to use the MCP framework to mint and
 * manage NFTs via Metaplex on Solana.
 */
async function main() {
  // Configure connection to Solana
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  console.log('Connected to Solana devnet');
  
  // Generate a wallet keypair (in a real app, this would be user-provided)
  const wallet = Keypair.generate();
  console.log(`Created wallet: ${wallet.publicKey.toString()}`);
  
  // Initialize context router
  const contextRouter = new ContextRouter(connection);
  const contextsDir = path.join(__dirname, '../../mcp-agents/contexts');
  
  // Load context definitions
  await contextRouter.loadContexts(contextsDir);
  
  // Create NFT agent
  const agent = new NFTMarketAgent({
    agentId: new PublicKey(wallet.publicKey),
    connection,
    supportedMarketplaces: ['Magic Eden', 'Tensor'],
    defaultRoyaltyBps: 500 // 5% royalty
  });
  
  console.log(`Created agent: ${agent.getName()}`);
  console.log(`Agent capabilities: ${agent.getCapabilities().join(', ')}`);
  
  // Process a natural language instruction for minting an NFT
  const instruction = 'Mint a new NFT named "MCP Protocol Demo" with symbol "MCPD" using metadata at https://arweave.net/example-metadata-uri';
  console.log(`\nProcessing instruction: "${instruction}"`);
  
  // Execute the instruction
  try {
    const result = await agent.processInstruction(instruction);
    
    console.log('\nAgent Response:');
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    
    if (result.data) {
      console.log('\nNFT Details:');
      console.log(`Name: ${result.data.name}`);
      console.log(`Symbol: ${result.data.symbol}`);
      console.log(`Metadata URI: ${result.data.metadataUri}`);
      console.log(`Mint Address: ${result.data.mintAddress}`);
      console.log(`Mint Time: ${result.data.mintTime}`);
      console.log(`Owner: ${result.data.owner}`);
    }
    
    if (result.transactionId) {
      console.log(`\nTransaction ID: ${result.transactionId}`);
    }
    
    if (!result.success && result.error) {
      console.error(`Error: ${result.error.message}`);
    }
    
    // Process a second instruction to list the NFT for sale
    if (result.success && result.data) {
      const mintAddress = result.data.mintAddress;
      const listInstruction = `List NFT ${mintAddress} for 5 SOL on Magic Eden`;
      console.log(`\nProcessing listing instruction: "${listInstruction}"`);
      
      const listResult = await agent.processInstruction(listInstruction);
      
      if (listResult.success && listResult.data) {
        console.log('\nListing Details:');
        console.log(`NFT: ${listResult.data.nftMint}`);
        console.log(`Price: ${listResult.data.price} SOL`);
        console.log(`Marketplace: ${listResult.data.marketplace}`);
        console.log(`Listing Time: ${listResult.data.listingTime}`);
        console.log(`Fees: ${listResult.data.fees} SOL`);
      }
    }
    
    // Process a third instruction to check a collection
    const collectionInstruction = "Check collection information for DEGODS";
    console.log(`\nProcessing collection check instruction: "${collectionInstruction}"`);
    
    const collectionResult = await agent.processInstruction(collectionInstruction);
    
    if (collectionResult.success && collectionResult.data) {
      console.log('\nCollection Details:');
      console.log(`Collection: ${collectionResult.data.collectionAddress}`);
      console.log(`Floor Price: ${collectionResult.data.floorPrice} SOL`);
      console.log(`Total Volume: ${collectionResult.data.totalVolume} SOL`);
      console.log(`Items: ${collectionResult.data.items}`);
      console.log(`Owners: ${collectionResult.data.owners}`);
      console.log(`Last Updated: ${collectionResult.data.lastUpdated}`);
    }
    
  } catch (error) {
    console.error('Failed to process instruction:', error);
  }
}

// Execute the example
main().catch(err => {
  console.error('Example failed with error:', err);
  process.exit(1);
});
