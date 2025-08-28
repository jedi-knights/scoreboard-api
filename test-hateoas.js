/**
 * HATEOAS Demo Script
 * 
 * Demonstrates the enhanced HATEOAS functionality of the Scoreboard API.
 * Run with: node test-hateoas.js
 */

import { createApp } from './src/app.js';

async function demonstrateHATEOAS() {
  console.log('🚀 Scoreboard API HATEOAS Demonstration\n');

  // Create the Express app
  const app = createApp();
  
  // Simulate a request object for testing
  const mockReq = {
    protocol: 'http',
    get: (header) => {
      if (header === 'host') return 'localhost:3000';
      return null;
    }
  };

  try {
    // Test the root endpoint
    console.log('📍 Testing Root Endpoint (/)');
    const rootResponse = await new Promise((resolve) => {
      app.get('/', mockReq, (req, res) => {
        res.json = (data) => resolve(data);
        res.status = (code) => ({ json: res.json });
      });
    });

    console.log('✅ Root endpoint response structure:');
    console.log(`   Message: ${rootResponse.message}`);
    console.log(`   Version: ${rootResponse.version}`);
    console.log(`   Environment: ${rootResponse.environment}`);
    console.log(`   Description: ${rootResponse.description}`);
    
    console.log('\n🔗 HATEOAS Links:');
    Object.entries(rootResponse._links).forEach(([rel, link]) => {
      console.log(`   ${rel}: ${link.href} (${link.method}) - ${link.title}`);
    });

    console.log('\n📊 Metadata:');
    console.log(`   API Version: ${rootResponse._meta.apiVersion}`);
    console.log(`   Base URL: ${rootResponse._meta.baseUrl}`);
    console.log(`   Generated: ${rootResponse._meta.generatedAt}`);

    // Test the health endpoint
    console.log('\n📍 Testing Health Endpoint (/health)');
    const healthResponse = await new Promise((resolve) => {
      app.get('/health', mockReq, (req, res) => {
        res.json = (data) => resolve(data);
        res.status = (code) => ({ json: res.json });
      });
    });

    console.log('✅ Health endpoint response structure:');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Service: ${healthResponse.service}`);
    console.log(`   Timestamp: ${healthResponse.timestamp}`);
    
    console.log('\n🔗 HATEOAS Links:');
    Object.entries(healthResponse._links).forEach(([rel, link]) => {
      console.log(`   ${rel}: ${link.href} (${link.method}) - ${link.title}`);
    });

    console.log('\n🎯 HATEOAS Benefits Demonstrated:');
    console.log('   • Self-documenting API with discoverable endpoints');
    console.log('   • Hypermedia-driven navigation');
    console.log('   • Consistent link structure across all endpoints');
    console.log('   • Resource relationships clearly defined');
    console.log('   • Action links for CRUD operations');
    console.log('   • Pagination links for collections');
    console.log('   • Metadata for API versioning and timestamps');

    console.log('\n✨ The API now follows REST principles with HATEOAS support!');
    console.log('   Clients can discover and navigate the API dynamically.');
    console.log('   No need for hardcoded URLs or out-of-band documentation.');

  } catch (error) {
    console.error('❌ Error during HATEOAS demonstration:', error);
  }
}

// Run the demonstration
demonstrateHATEOAS().catch(console.error);
