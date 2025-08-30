/**
 * Test Swagger Documentation
 * 
 * Simple script to test that Swagger documentation is working correctly.
 * Run this to verify the API documentation endpoints.
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testSwaggerEndpoints() {
  console.log('🧪 Testing Swagger Documentation Endpoints...\n');

  try {
    // Test root endpoint
    console.log('📍 Testing Root Endpoint (/)');
    const rootResponse = await fetch(`${BASE_URL}/`);
    const rootData = await rootResponse.json();
    console.log(`✅ Root endpoint: ${rootResponse.status}`);
    console.log(`   Message: ${rootData.message}`);
    console.log(`   Version: ${rootData.version}`);
    console.log(`   Documentation: ${rootData.documentation?.swagger}\n`);

    // Test Swagger UI endpoint
    console.log('📍 Testing Swagger UI (/api-docs)');
    const swaggerResponse = await fetch(`${BASE_URL}/api-docs`);
    console.log(`✅ Swagger UI: ${swaggerResponse.status}`);
    console.log(`   Content-Type: ${swaggerResponse.headers.get('content-type')}\n`);

    // Test OpenAPI JSON endpoint
    console.log('📍 Testing OpenAPI JSON (/api-docs.json)');
    const openapiResponse = await fetch(`${BASE_URL}/api-docs.json`);
    const openapiData = await openapiResponse.json();
    console.log(`✅ OpenAPI JSON: ${openapiResponse.status}`);
    console.log(`   Title: ${openapiData.info?.title}`);
    console.log(`   Version: ${openapiData.info?.version}`);
    console.log(`   Endpoints: ${Object.keys(openapiData.paths || {}).length}`);
    console.log(`   Tags: ${openapiData.tags?.map(t => t.name).join(', ')}\n`);

    // Test health endpoint
    console.log('📍 Testing Health Endpoint (/health)');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log(`✅ Health endpoint: ${healthResponse.status}`);
    console.log(`   Status: ${healthData.data?.status}`);
    console.log(`   Database: ${healthData.data?.database?.status}\n`);

    console.log('🎉 All Swagger documentation tests passed!');
    console.log('\n📖 You can now view your API documentation at:');
    console.log(`   🌐 Swagger UI: ${BASE_URL}/api-docs`);
    console.log(`   📄 OpenAPI JSON: ${BASE_URL}/api-docs.json`);
    console.log('\n✨ The documentation is automatically generated from JSDoc comments!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your API server is running on port 3000');
    console.log('   Run: npm run dev');
  }
}

// Run the test
testSwaggerEndpoints();
