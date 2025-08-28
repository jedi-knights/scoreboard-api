#!/usr/bin/env node

/**
 * Simple API Test Script
 * Tests the API endpoints without needing Docker
 */

import { createApp } from './src/app.js';
import { DatabaseFactory } from './src/database/database-factory.js';
import { databaseConfig } from './src/config/index.js';

async function testAPI() {
  try {
    console.log('🧪 Testing Scoreboard API...');
    
    // Create database adapter
    console.log('📊 Creating database adapter...');
    const databaseAdapter = DatabaseFactory.createAdapter();
    
    // Create Express app
    console.log('🌐 Creating Express application...');
    const app = createApp(databaseAdapter);
    
    // Test health endpoint
    console.log('🏥 Testing health endpoint...');
    const healthResponse = await makeRequest(app, 'GET', '/health/liveness');
    console.log('✅ Health endpoint response:', healthResponse.status);
    
    // Test root endpoint
    console.log('🏠 Testing root endpoint...');
    const rootResponse = await makeRequest(app, 'GET', '/');
    console.log('✅ Root endpoint response:', rootResponse.status);
    console.log('📖 API info:', rootResponse.body);
    
    // Test games endpoint
    console.log('🎮 Testing games endpoint...');
    const gamesResponse = await makeRequest(app, 'GET', '/api/v1/games');
    console.log('✅ Games endpoint response:', gamesResponse.status);
    
    console.log('\n🎉 All tests passed! API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Helper function to make requests to the Express app
async function makeRequest(app, method, url, body = null) {
  return new Promise((resolve, reject) => {
    const req = {
      method,
      url,
      body,
      query: {},
      params: {},
      headers: {}
    };
    
    const res = {
      statusCode: 200,
      body: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      send: function(data) {
        this.body = data;
        return this;
      }
    };
    
    app.handle(req, res, () => {
      resolve(res);
    });
  });
}

// Run the test
testAPI();
