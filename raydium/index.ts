import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolanaDeFiAgent } from 'mcp-agents/src/agents/solana-defi-agent';
import { ContextRouter } from 'mcp-agents/src/context-router';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This example demonstrates how to use the MCP framework to execute
 * liquidity provision on Raydium on Solana.
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
  
  // Create DeFi agent
  const agent = new SolanaDeFiAgent({
    agentId: new PublicKey(wallet.publicKey),
    connection,
    supportedDexes: ['Raydium'],
    defaultSlippageBps: 50 // 0.5% slippage
  });
  
  console.log(`Created agent: ${agent.getName()}`);
  console.log(`Agent capabilities: ${agent.getCapabilities().join(', ')}`);
  
  // Process a natural language instruction for liquidity provision
  const instruction = 'Add liquidity to SOL/USDC pool on Raydium with 1 SOL and 15 USDC';
  console.log(`\nProcessing instruction: "${instruction}"`);
  
  // Execute the instruction
  try {
    const result = await agent.processInstruction(instruction);
    
    console.log('\nAgent Response:');
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    
    if (result.data) {
      console.log('\nLiquidity Addition Details:');
      console.log(`Pool ID: ${result.data.poolId}`);
      console.log(`Token A: ${result.data.tokenA}`);
      console.log(`Amount A: ${result.data.amountA}`);
      console.log(`Token B: ${result.data.tokenB}`);
      console.log(`Amount B: ${result.data.amountB}`);
      console.log(`LP Tokens Received: ${result.data.lpTokens}`);
    }
    
    if (result.transactionId) {
      console.log(`\nTransaction ID: ${result.transactionId}`);
    }
    
    if (!result.success && result.error) {
      console.error(`Error: ${result.error.message}`);
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
