# Docker Swagger Integration

## Overview

The Swagger documentation is fully integrated with Docker and automatically generates comprehensive API documentation when your container starts. No manual steps or external tools are required.

## 🐳 How It Works in Docker

### **Build Process**
1. **Source Code Copy**: Your route files with JSDoc comments are copied to the container
2. **Dependencies**: All Swagger packages (`swagger-jsdoc`, `swagger-ui-express`) are installed
3. **Static Assets**: Swagger UI assets are bundled with your application

### **Runtime Process**
1. **Container Start**: When `npm start` runs, your Express app initializes
2. **Automatic Scanning**: Swagger middleware scans all route files for JSDoc comments
3. **Documentation Generation**: Creates fresh OpenAPI specification and Swagger UI
4. **Endpoint Availability**: Both `/api-docs` and `/api-docs.json` become immediately accessible

## 🚀 Testing Docker Swagger

### **Quick Test**
```bash
# Test that Swagger works in Docker
npm run test:docker-swagger
```

This script will:
- Build your Docker image
- Start a test container
- Verify all Swagger endpoints are accessible
- Clean up automatically

### **Manual Testing**
```bash
# Build the image
docker build -t scoreboard-api .

# Run the container
docker run -d -p 3001:3000 --name scoreboard-api-test scoreboard-api

# Wait for startup (about 10 seconds)
sleep 10

# Test Swagger endpoints
curl http://localhost:3001/api-docs
curl http://localhost:3001/api-docs.json

# Clean up
docker stop scoreboard-api-test
docker rm scoreboard-api-test
```

## 📍 **Access Points in Docker**

### **Local Development**
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

### **Docker Container**
- **Swagger UI**: `http://localhost:3001/api-docs` (when mapped to port 3001)
- **OpenAPI JSON**: `http://localhost:3001/api-docs.json`

### **Production Deployment**
- **Swagger UI**: `https://your-domain.com/api-docs`
- **OpenAPI JSON**: `https://your-domain.com/api-docs.json`

## 🔧 **Docker Configuration**

### **Current Dockerfile**
Your Dockerfile is already perfectly configured:

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

# Copy source code (includes JSDoc comments)
COPY . .

# Production stage
FROM node:18-alpine AS production

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/src ./src

# Start the application
CMD ["npm", "start"]
```

### **Key Points**
- ✅ **Source Code**: All route files with JSDoc comments are copied
- ✅ **Dependencies**: Swagger packages are installed as production dependencies
- ✅ **Runtime Generation**: Documentation is generated when the container starts
- ✅ **Health Checks**: Container health checks verify the API is working

## 🌍 **Environment Variables**

The Swagger configuration automatically adapts to your Docker environment:

```javascript
// In swagger-config.js
servers: [
  {
    url: process.env.API_BASE_URL || 'http://localhost:3000',
    description: 'Development server'
  },
  {
    url: process.env.PRODUCTION_API_URL || 'https://api.scoreboard.com',
    description: 'Production server'
  }
]
```

### **Setting in Docker**
```bash
# Development
docker run -e API_BASE_URL=http://localhost:3000 scoreboard-api

# Production
docker run -e PRODUCTION_API_URL=https://api.yourdomain.com scoreboard-api
```

## 📊 **Verification Commands**

### **Check Container Status**
```bash
# View container logs
docker logs <container-id>

# Check container health
docker inspect <container-id> | grep Health -A 10

# Test endpoints from inside container
docker exec <container-id> curl http://localhost:3000/health
```

### **Test Swagger Endpoints**
```bash
# Test from host machine
curl http://localhost:3001/api-docs
curl http://localhost:3001/api-docs.json

# Test specific API endpoints
curl http://localhost:3001/api/v1/ncaa/ingest/health
```

## 🚨 **Troubleshooting**

### **Documentation Not Available**
1. **Check container logs**:
   ```bash
   docker logs <container-id>
   ```

2. **Verify Swagger initialization**:
   Look for: `"Swagger documentation generated successfully"`

3. **Check route scanning**:
   Ensure your route files are being copied to the container

### **Common Issues**
- **Port mapping**: Ensure you're mapping the correct ports
- **Container startup time**: Wait 10-15 seconds for full initialization
- **Health checks**: Verify the container is healthy before testing

### **Debug Mode**
Add logging to see what's happening:

```javascript
// In swagger.js middleware
logger.info('Swagger config:', swaggerConfig);
logger.info('Route files to scan:', swaggerConfig.apis);
```

## 🎯 **Production Considerations**

### **Security**
- Swagger UI is available in production by default
- Consider restricting access in production environments
- Use environment variables to control availability

### **Performance**
- Documentation generation happens once at startup
- No runtime performance impact
- Swagger UI assets are served statically

### **Monitoring**
- Health checks verify API availability
- Logs show Swagger initialization status
- Container metrics include Swagger endpoint performance

## ✨ **Benefits of Docker Integration**

1. **Consistency**: Same documentation in all environments
2. **Automation**: No manual documentation generation
3. **Versioning**: Documentation always matches deployed code
4. **Scalability**: Works with container orchestration (Kubernetes, Docker Swarm)
5. **CI/CD**: Documentation is automatically updated with deployments

## 🔄 **Continuous Integration**

### **GitHub Actions**
Your existing CI pipeline will automatically test Swagger in Docker:

```yaml
# In your CI workflow
- name: Test Docker Swagger
  run: npm run test:docker-swagger
```

### **Pre-deployment Testing**
```bash
# Test before deployment
npm run test:docker-swagger

# Build production image
docker build -t scoreboard-api:production .

# Verify documentation
docker run -d -p 3001:3000 scoreboard-api:production
sleep 15
curl http://localhost:3001/api-docs
```

---

## 🎉 **Summary**

**Yes, when your Docker image builds, Swagger documentation will be automatically generated and available!**

- ✅ **Build Time**: All necessary code and dependencies are included
- ✅ **Runtime**: Documentation is generated fresh when the container starts
- ✅ **Automatic**: No manual steps or external tools required
- ✅ **Always Current**: Documentation reflects the exact code running in the container
- ✅ **Production Ready**: Works in all environments (dev, staging, production)

Your Swagger documentation is now fully Docker-integrated and will work seamlessly in any containerized environment!
