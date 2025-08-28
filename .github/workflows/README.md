# CI/CD Workflows

This directory contains GitHub Actions workflows that automate the validation, testing, and deployment of the Scoreboard API.

## 🚀 Workflow Overview

### 1. **CI - API Validation** (`ci.yml`)
**Main comprehensive validation workflow that runs on:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger (`workflow_dispatch`)

**What it validates:**
- ✅ **Linting & Code Quality**: ESLint, code formatting
- ✅ **Unit Tests**: Business logic validation (Node.js 18 & 20, multiple OS)
- ✅ **Integration Tests**: API endpoints with SQLite and PostgreSQL
- ✅ **Security Audit**: npm audit for vulnerabilities
- ✅ **Docker Build**: Container creation and testing
- ✅ **API Validation**: Live API endpoint testing
- ✅ **Performance Testing**: Response time validation
- ✅ **Coverage Threshold**: Ensures 80% test coverage

**Matrix Testing:**
- **Node.js versions**: 18.x, 20.x
- **Operating systems**: Ubuntu, Windows, macOS
- **Databases**: SQLite (fast), PostgreSQL (realistic)

### 2. **PR Check - Quick Validation** (`pr-check.yml`)
**Fast validation for pull requests:**
- Runs on every PR to `main` or `develop`
- **Timeout**: 10 minutes maximum
- **Focus**: Essential checks only

**What it validates:**
- ✅ **Linting**: Code quality standards
- ✅ **Unit Tests**: Business logic
- ✅ **Integration Tests**: SQLite only (fastest)
- ✅ **Coverage**: 80% threshold check

**Benefits:**
- Quick feedback for developers
- Prevents obvious issues from reaching main branch
- Runs in parallel with other checks

### 3. **Security & Dependencies** (`security.yml`)
**Security-focused workflow that runs:**
- **Daily at 2 AM UTC** (automated)
- On dependency file changes
- Manual trigger

**What it does:**
- 🔒 **Dependency Updates**: Check for outdated packages
- 🔒 **Security Scanning**: npm audit for vulnerabilities
- 🔒 **CodeQL Analysis**: GitHub's semantic code analysis
- 🔒 **Container Scanning**: Trivy vulnerability scanner
- 🔒 **Automated Issues**: Create issues for security updates

**Security Features:**
- Automated vulnerability detection
- Container image security scanning
- Code quality analysis
- Dependency update notifications

## 🎯 Workflow Strategy

### **Fast Feedback Loop**
1. **PR Check** (10 min) → Quick validation
2. **Full CI** (15-20 min) → Comprehensive testing
3. **Security** (Daily) → Ongoing security monitoring

### **Progressive Validation**
- **Level 1**: Basic checks (linting, unit tests)
- **Level 2**: Integration testing (SQLite)
- **Level 3**: Full integration (PostgreSQL)
- **Level 4**: Container and performance testing
- **Level 5**: Security and dependency analysis

### **Fail-Fast Approach**
- Stop on first failure to save resources
- Parallel execution where possible
- Clear error messages and next steps

## 🔧 Configuration

### **Environment Variables**
```yaml
env:
  NODE_ENV: test
  TEST_DATABASE: sqlite  # or postgres
```

### **Node.js Versions**
- **Primary**: 18.x (LTS)
- **Secondary**: 20.x (Latest LTS)
- **Matrix**: Multiple OS combinations

### **Database Testing**
- **SQLite**: Fast, no Docker required
- **PostgreSQL**: Real database, Docker container
- **Coverage**: Both databases for comprehensive testing

## 📊 Metrics & Reporting

### **Coverage Requirements**
- **Minimum**: 80% across all metrics
- **Branches**: All code paths tested
- **Functions**: All functions covered
- **Lines**: All lines executed
- **Statements**: All statements covered

### **Performance Benchmarks**
- **Response Time**: < 100ms for health endpoints
- **Load Testing**: 10 concurrent requests
- **Docker Build**: < 5 minutes
- **Test Execution**: < 10 minutes for unit tests

### **Quality Gates**
- ✅ All tests pass
- ✅ Coverage meets threshold
- ✅ No security vulnerabilities
- ✅ Linting passes
- ✅ Docker builds successfully
- ✅ API endpoints respond correctly

## 🚨 Failure Handling

### **Common Issues & Solutions**

#### **Test Failures**
```bash
# Run tests locally
npm test
npm run test:unit
npm run test:integration

# Check coverage
npm run test:coverage
```

#### **Linting Errors**
```bash
# Fix automatically
npm run lint:fix

# Check manually
npm run lint
```

#### **Security Issues**
```bash
# Check vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

#### **Docker Issues**
```bash
# Build locally
docker build -t scoreboard-api .

# Test container
docker run -p 3000:3000 scoreboard-api
```

### **Workflow Recovery**
1. **Fix the issue** locally
2. **Test thoroughly** before pushing
3. **Push changes** to trigger new workflow
4. **Monitor progress** in Actions tab

## 🔄 Continuous Improvement

### **Workflow Optimization**
- **Caching**: npm dependencies, Docker layers
- **Parallelization**: Independent jobs run simultaneously
- **Resource Management**: Appropriate timeouts and resource limits
- **Failure Analysis**: Learn from failures to improve workflows

### **Monitoring & Alerts**
- **Success Rate**: Track workflow success over time
- **Execution Time**: Monitor performance trends
- **Resource Usage**: Optimize GitHub Actions minutes
- **Security Trends**: Track vulnerability patterns

## 📚 Resources

### **GitHub Actions Documentation**
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Node.js Setup](https://github.com/actions/setup-node)
- [Docker Actions](https://github.com/docker/setup-buildx-action)
- [CodeQL](https://docs.github.com/en/code-security/code-scanning/using-codeql)

### **Testing Resources**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testcontainers](https://testcontainers.com/)
- [Supertest](https://github.com/visionmedia/supertest)

### **Security Resources**
- [npm Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Trivy Scanner](https://aquasecurity.github.io/trivy/)
- [CodeQL](https://codeql.github.com/)

## 🤝 Contributing

### **Adding New Workflows**
1. **Create workflow file** in `.github/workflows/`
2. **Follow naming convention**: `purpose-description.yml`
3. **Add documentation** to this README
4. **Test locally** before committing
5. **Update dependencies** as needed

### **Modifying Existing Workflows**
1. **Understand the purpose** of the workflow
2. **Test changes** in a branch first
3. **Update documentation** to reflect changes
4. **Monitor execution** after deployment
5. **Rollback** if issues arise

### **Best Practices**
- **Fail fast**: Stop on first error
- **Clear messages**: Helpful error descriptions
- **Resource efficiency**: Minimize execution time
- **Security first**: Always scan for vulnerabilities
- **Documentation**: Keep workflows self-documenting
