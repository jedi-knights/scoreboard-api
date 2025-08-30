# Git and Docker Ignore Files Guide

## Overview

This guide explains what files should be ignored in your `.gitignore` and `.dockerignore` files, especially with the new Swagger documentation setup.

## 📁 `.gitignore` - What to Ignore

### ✅ **Should Ignore (Already Added)**

#### **Dependencies & Build Artifacts**
- `node_modules/` - NPM dependencies
- `coverage/` - Test coverage reports
- `dist/`, `build/`, `out/` - Build outputs
- `*.tsbuildinfo` - TypeScript build info

#### **Environment & Configuration**
- `.env*` - All environment files
- `config/local.js` - Local configuration
- `secrets.json` - Secret files
- `*.key`, `*.pem`, `*.crt` - SSL certificates

#### **Logs & Runtime Data**
- `*.log` - All log files
- `logs/` - Log directories
- `*.pid` - Process ID files

#### **IDE & Editor Files**
- `.vscode/` - VS Code settings
- `.idea/` - IntelliJ settings
- `*.swp`, `*.swo` - Vim swap files

#### **OS Generated Files**
- `.DS_Store` - macOS system files
- `Thumbs.db` - Windows thumbnail cache

#### **Docker Files**
- `.dockerignore` - Docker ignore file
- `docker-compose*.yml` - Docker compose files

#### **Swagger Generated Files**
- `swagger-output/` - Generated Swagger files
- `openapi-spec.json` - OpenAPI specification
- `api-docs.json` - API documentation JSON

### ❌ **Should NOT Ignore**

#### **Source Code**
- `src/` - Your application source code
- `*.js` - JavaScript files
- `*.json` - Configuration files (except secrets)

#### **Documentation**
- `docs/` - Documentation directory
- `README.md` - Project readme
- `LICENSE` - License file

#### **Configuration**
- `package.json` - NPM package configuration
- `package-lock.json` - NPM lock file
- `jest.config.js` - Jest configuration
- `.eslintrc*` - ESLint configuration

#### **Tests**
- `tests/` - Test directory
- `test-*.js` - Test scripts
- `test-*.sh` - Test shell scripts

## 🐳 `.dockerignore` - What to Ignore

### ✅ **Should Ignore (Already Added)**

#### **Development Files**
- `tests/` - Test files (not needed in production)
- `*.test.js` - Test JavaScript files
- `*.spec.js` - Test specification files
- `jest.config.js` - Jest configuration

#### **Documentation (Partial)**
- `README.md` - Keep for reference
- `CHANGELOG.md` - Keep for reference
- `LICENSE` - Keep for reference
- `docs/` - Exclude detailed documentation

#### **Build & Cache**
- `node_modules/` - Will be installed fresh
- `coverage/` - Test coverage not needed
- `*.map` - Source maps not needed
- `.cache/` - Cache directories

#### **CI/CD & Development**
- `.github/` - GitHub workflows
- `.git/` - Git repository data
- `.eslintrc*` - Linting config not needed

#### **Swagger Generated Files**
- `swagger-output/` - Generated files
- `openapi-spec.json` - Generated spec
- `api-docs.json` - Generated docs

### ❌ **Should NOT Ignore**

#### **Essential Source Code**
- `src/` - Your application source
- `package.json` - Dependencies
- `package-lock.json` - Lock file

#### **Core Configuration**
- `src/config/` - Application configuration
- `src/middleware/` - Middleware files
- `src/routes/` - Route definitions

#### **Swagger Source**
- `src/config/swagger-config.js` - Swagger configuration
- `src/middleware/swagger.js` - Swagger middleware
- Route files with JSDoc comments

## 🔍 **Why These Rules Matter**

### **For Git (.gitignore)**
1. **Security**: Prevents committing secrets and certificates
2. **Clean Repository**: Excludes build artifacts and dependencies
3. **Team Collaboration**: Everyone gets the same clean codebase
4. **Size Management**: Keeps repository size reasonable

### **For Docker (.dockerignore)**
1. **Image Size**: Smaller production images
2. **Security**: Excludes development and test files
3. **Build Speed**: Faster Docker builds
4. **Production Ready**: Only includes what's needed to run

## 🚨 **Common Mistakes to Avoid**

### **Don't Ignore in Git**
- ❌ `src/` - Your source code
- ❌ `package.json` - Dependencies
- ❌ `docs/` - Documentation
- ❌ Route files with JSDoc comments

### **Don't Ignore in Docker**
- ❌ `src/config/swagger-config.js` - Swagger config
- ❌ `src/middleware/swagger.js` - Swagger middleware
- ❌ Route files - Need JSDoc comments for Swagger

### **Do Ignore in Both**
- ✅ `node_modules/` - Dependencies
- ✅ `*.log` - Log files
- ✅ `.env*` - Environment files
- ✅ `coverage/` - Test coverage

## 🧪 **Testing Your Ignore Files**

### **Test Git Ignore**
```bash
# Check what would be ignored
git status --ignored

# Check specific files
git check-ignore src/config/swagger-config.js
git check-ignore node_modules/
```

### **Test Docker Ignore**
```bash
# Build image and check contents
docker build -t test-image .
docker run --rm test-image ls -la /app

# Check what's excluded
docker build --progress=plain 2>&1 | grep "sending build context"
```

## 📋 **Quick Reference**

### **Essential Files to Keep**
```
src/                    # Source code
package.json           # Dependencies
src/config/            # Configuration
src/middleware/        # Middleware
src/routes/            # Routes with JSDoc
docs/                  # Documentation
tests/                 # Test files
```

### **Essential Files to Ignore**
```
node_modules/          # Dependencies
.env*                  # Environment
*.log                  # Logs
coverage/              # Test coverage
.DS_Store             # OS files
.vscode/              # IDE files
```

## ✨ **Benefits of Proper Ignoring**

1. **Security**: No secrets accidentally committed
2. **Performance**: Faster Git operations and Docker builds
3. **Cleanliness**: Organized, professional repositories
4. **Efficiency**: Team members get clean codebases
5. **Production Ready**: Docker images contain only necessary files

---

Your ignore files are now properly configured for both Git and Docker, ensuring your Swagger documentation works correctly while maintaining security and performance! 🎉
