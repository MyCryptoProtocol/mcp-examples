import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Agent, AgentContext, AgentResponse } from 'mcp-agents/src/agent-template';
import { ContextRouter } from 'mcp-agents/src/context-router';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Governance-specific agent that extends the base Agent class
 */
class GovernanceAgent extends Agent {
  private daoName: string;
  private realmAddress: string;
  
  constructor(context: AgentContext & { daoName: string, realmAddress: string }) {
    super(context);
    this.daoName = context.daoName;
    this.realmAddress = context.realmAddress;
  }
  
  getName(): string {
    return `${this.daoName} Governance Agent`;
  }
  
  getDescription(): string {
    return `Agent for interacting with ${this.daoName} DAO via Realms governance`;
  }
  
  getCapabilities(): string[] {
    return [
      'Proposal Creation',
      'Vote Casting',
      'DAO Treasury Management',
      'Governance Analytics',
      'Member Management'
    ];
  }
  
  async processInstruction(instruction: string): Promise<AgentResponse> {
    // This is a simplified implementation - in reality, it would parse the instruction
    // using NLP and route to the appropriate governance action
    
    if (instruction.toLowerCase().includes('create proposal')) {
      return this.createProposal(instruction);
    } else if (instruction.toLowerCase().includes('vote') || instruction.toLowerCase().includes('cast')) {
      return this.castVote(instruction);
    } else if (instruction.toLowerCase().includes('treasury')) {
      return this.treasuryAction(instruction);
    } else {
      return {
        success: false,
        message: 'Unsupported governance instruction',
        error: {
          code: 400,
          message: 'Could not parse governance instruction'
        }
      };
    }
  }
  
  async executeTransaction(transaction: any): Promise<string> {
    // In a real implementation, this would sign and send the transaction
    return 'simulated-transaction-signature';
  }
  
  async getState(): Promise<Record<string, any>> {
    return {
      daoName: this.daoName,
      realmAddress: this.realmAddress,
      agentId: this.agentId.toString()
    };
  }
  
  // Helper methods for governance operations
  
  private async createProposal(instruction: string): Promise<AgentResponse> {
    const title = instruction.includes('titled') 
      ? instruction.split('titled')[1].trim().split('"')[1] || 'Untitled Proposal'
      : 'Untitled Proposal';
    
    return {
      success: true,
      message: `Created new governance proposal: "${title}"`,
      data: {
        type: 'proposal',
        title,
        createdAt: new Date().toISOString(),
        proposalAddress: 'Gx7dJvn9PD9G6uUPsVQCjrCgPy9ogHZ7GzZm5HVF37EL', // Simulated address
        votingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      }
    };
  }
  
  private async castVote(instruction: string): Promise<AgentResponse> {
    // Extract proposal ID and vote direction from instruction
    const proposalId = 'Gx7dJvn9PD9G6uUPsVQCjrCgPy9ogHZ7GzZm5HVF37EL'; // This would be extracted from the instruction
    const voteFor = !instruction.toLowerCase().includes('against');
    
    return {
      success: true,
      message: `Vote cast ${voteFor ? 'for' : 'against'} proposal`,
      data: {
        type: 'vote',
        proposalId,
        vote: voteFor ? 'for' : 'against',
        votingPower: '1000',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  private async treasuryAction(instruction: string): Promise<AgentResponse> {
    return {
      success: true,
      message: 'Treasury information retrieved',
      data: {
        type: 'treasury',
        balance: '15000 SOL',
        tokens: [
          { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', amount: '25000' },
          { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', symbol: 'mSOL', amount: '150' }
        ],
        governanceAddress: 'G5trKGedmTdqpn6wqfX3KdPnBXriazkWuSEBrUEFQ1qJ', // Simulated address
        lastActivity: new Date().toISOString()
      }
    };
  }
}

/**
 * This example demonstrates how to use the MCP framework to interact
 * with a DAO through the Realms governance protocol on Solana.
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
  
  // Create governance agent for a specific DAO
  const agent = new GovernanceAgent({
    agentId: new PublicKey(wallet.publicKey),
    connection,
    daoName: 'MCP Community',
    realmAddress: 'G5trKGedmTdqpn6wqfX3KdPnBXriazkWuSEBrUEFQ1qJ' // Simulated Realm address
  });
  
  console.log(`Created agent: ${agent.getName()}`);
  console.log(`Agent capabilities: ${agent.getCapabilities().join(', ')}`);
  
  // Process a natural language instruction for creating a governance proposal
  const instruction = 'Create a new proposal titled "Increase Treasury Allocation for Developer Grants" to allocate 1000 USDC for developer grants';
  console.log(`\nProcessing instruction: "${instruction}"`);
  
  // Execute the instruction
  try {
    const result = await agent.processInstruction(instruction);
    
    console.log('\nAgent Response:');
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    
    if (result.data) {
      console.log('\nProposal Details:');
      console.log(`Title: ${result.data.title}`);
      console.log(`Created At: ${result.data.createdAt}`);
      console.log(`Proposal Address: ${result.data.proposalAddress}`);
      console.log(`Voting Ends At: ${result.data.votingEndsAt}`);
    }
    
    if (result.transactionId) {
      console.log(`\nTransaction ID: ${result.transactionId}`);
    }
    
    if (!result.success && result.error) {
      console.error(`Error: ${result.error.message}`);
    }
    
    // Get governance treasury information
    console.log('\nFetching DAO treasury information...');
    const treasuryResult = await agent.processInstruction('Show the treasury balance and tokens');
    
    if (treasuryResult.success && treasuryResult.data) {
      console.log('\nTreasury Information:');
      console.log(`Total Balance: ${treasuryResult.data.balance}`);
      console.log('Token Holdings:');
      treasuryResult.data.tokens.forEach((token: any) => {
        console.log(`- ${token.amount} ${token.symbol} (${token.mint})`);
      });
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
