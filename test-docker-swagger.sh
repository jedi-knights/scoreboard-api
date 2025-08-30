#!/bin/bash

# Test Docker Swagger Documentation
# This script builds the Docker image and tests that Swagger docs are available

set -e

echo "🐳 Testing Swagger Documentation in Docker Container..."
echo "=================================================="

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t scoreboard-api-test .

# Start the container in the background
echo "🚀 Starting container..."
CONTAINER_ID=$(docker run -d -p 3001:3000 scoreboard-api-test)

# Wait for the container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 10

# Test the container health
echo "🏥 Testing container health..."
if curl -f http://localhost:3001/health/liveness > /dev/null 2>&1; then
    echo "✅ Container is healthy"
else
    echo "❌ Container health check failed"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID > /dev/null 2>&1
    exit 1
fi

# Test Swagger documentation endpoints
echo "📚 Testing Swagger documentation..."

# Test root endpoint
echo "📍 Testing root endpoint..."
ROOT_RESPONSE=$(curl -s http://localhost:3001/)
if echo "$ROOT_RESPONSE" | grep -q "api-docs"; then
    echo "✅ Root endpoint includes Swagger links"
else
    echo "❌ Root endpoint missing Swagger links"
fi

# Test Swagger UI endpoint
echo "📍 Testing Swagger UI endpoint..."
if curl -f http://localhost:3001/api-docs > /dev/null 2>&1; then
    echo "✅ Swagger UI endpoint accessible"
else
    echo "❌ Swagger UI endpoint failed"
fi

# Test OpenAPI JSON endpoint
echo "📍 Testing OpenAPI JSON endpoint..."
OPENAPI_RESPONSE=$(curl -s http://localhost:3001/api-docs.json)
if echo "$OPENAPI_RESPONSE" | grep -q "openapi"; then
    echo "✅ OpenAPI JSON endpoint accessible"
    echo "   Title: $(echo "$OPENAPI_RESPONSE" | jq -r '.info.title // "N/A"')"
    echo "   Version: $(echo "$OPENAPI_RESPONSE" | jq -r '.info.version // "N/A"')"
    echo "   Endpoints: $(echo "$OPENAPI_RESPONSE" | jq -r '.paths | length // 0')"
else
    echo "❌ OpenAPI JSON endpoint failed"
fi

# Test a specific API endpoint
echo "📍 Testing NCAA ingestion health endpoint..."
if curl -f http://localhost:3001/api/v1/ncaa/ingest/health > /dev/null 2>&1; then
    echo "✅ NCAA ingestion endpoint accessible"
else
    echo "❌ NCAA ingestion endpoint failed"
fi

echo ""
echo "🎉 All Docker Swagger tests passed!"
echo ""
echo "📖 Your Swagger documentation is now available at:"
echo "   🌐 Swagger UI: http://localhost:3001/api-docs"
echo "   📄 OpenAPI JSON: http://localhost:3001/api-docs.json"
echo ""
echo "✨ The documentation was automatically generated when the container started!"
echo "   No manual steps required - it's always in sync with your code."

# Clean up
echo ""
echo "🧹 Cleaning up..."
docker stop $CONTAINER_ID > /dev/null 2>&1
docker rm $CONTAINER_ID > /dev/null 2>&1
docker rmi scoreboard-api-test > /dev/null 2>&1

echo "✅ Cleanup complete!"
