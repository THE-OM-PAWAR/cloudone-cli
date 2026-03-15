# CloudOne CLI - Quick Start Guide

Get started with CloudOne CLI in 5 minutes!

## Installation

### Option 1: Install from npm (when published)

```bash
npm install -g cloudone-cli
```

### Option 2: Install from source

```bash
# Clone the repository
cd cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Link globally
npm link

# Verify installation
cloudone --version
```

## First Time Setup

### Step 1: Login

```bash
cloudone login
```

This will:
1. Open your browser
2. Navigate to the authentication page
3. Display your CLI token

### Step 2: Save Token

Copy the token from the browser and run:

```bash
cloudone auth:token <YOUR_TOKEN>
```

You should see:
```
✓ Authentication successful!

✓ You are now logged in to CloudOne
```

### Step 3: Verify Connection

```bash
cloudone repositories
```

This will list all your GitHub repositories.

## Common Workflows

### Workflow 1: Deploy Existing Project

```bash
# Navigate to your project
cd my-project

# Initialize CloudOne
cloudone init

# Deploy with custom subdomain
cloudone deploy --subdomain myapp

# Your app will be live at: https://myapp.cloudone.dev
```

### Workflow 2: Deploy from GitHub

```bash
# Browse your repositories
cloudone repositories

# Select a repository and deploy
cloudone deploy --repo username/my-repo --subdomain myapp
```

### Workflow 3: Code Review & Fix

```bash
# Navigate to your project
cd my-project

# Initialize if not done
cloudone init

# Start AI code review
cloudone start-review

# Apply AI-generated fixes
cloudone code-fix

# Review changes
git diff

# Commit and push
git add .
git commit -m "Applied CloudOne AI fixes"
git push
```

### Workflow 4: Manage Deployments

```bash
# List all deployments
cloudone deployments

# View deployment details
# (Copy subdomain from list)
```

## Configuration

### Global Config Location

```
~/.cloudone/config.json
```

Contains:
- Authentication token
- API URL
- User information

### Project Config Location

```
.cloudone
```

Contains:
- Project ID
- Framework detection
- Repository information

## Environment Variables

Set custom API URL:

```bash
# Linux/Mac
export CLOUDONE_API_URL=https://api.cloudone.dev

# Windows (PowerShell)
$env:CLOUDONE_API_URL="https://api.cloudone.dev"

# Windows (CMD)
set CLOUDONE_API_URL=https://api.cloudone.dev
```

## Troubleshooting

### Issue: "Not authenticated"

```bash
cloudone logout
cloudone login
cloudone auth:token <NEW_TOKEN>
```

### Issue: "Git not installed"

Install Git:
- Windows: https://git-scm.com/download/win
- Mac: `brew install git`
- Linux: `sudo apt-get install git`

### Issue: "Could not detect repository"

Make sure you're in a Git repository:

```bash
git init
git remote add origin https://github.com/username/repo.git
```

### Issue: "Connection refused"

Check if backend is running:

```bash
# Default: http://localhost:3000
curl http://localhost:3000/api/health
```

Or specify custom URL:

```bash
cloudone login --url https://api.cloudone.dev
```

## Command Reference

### Authentication
- `cloudone login` - Start authentication
- `cloudone auth:token <token>` - Save token
- `cloudone logout` - Logout

### Project
- `cloudone init` - Initialize project
- `cloudone repositories` - List repositories

### Code Review
- `cloudone start-review` - Start review
- `cloudone code-fix` - Apply fixes

### Deployment
- `cloudone deploy` - Deploy application
- `cloudone deployments` - List deployments

## Tips & Tricks

### 1. Use Aliases

Add to your shell config:

```bash
alias co="cloudone"
alias cod="cloudone deploy"
alias cor="cloudone repositories"
```

### 2. Quick Deploy

```bash
# One-liner deploy
cd my-project && cloudone init && cloudone deploy --subdomain myapp
```

### 3. Auto-commit Fixes

```bash
# Apply fixes and auto-commit
cloudone code-fix && git add . && git commit -m "AI fixes" && git push
```

### 4. Check Status

```bash
# View all deployments
cloudone deployments | grep deployed
```

## Next Steps

1. ✅ Install CLI
2. ✅ Authenticate
3. ✅ Deploy first app
4. 📚 Read full documentation: [README.md](./README.md)
5. 🔧 Integrate with CI/CD
6. 🚀 Deploy more apps!

## Support

- 📖 Documentation: [README.md](./README.md)
- 🔧 Backend Integration: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
- 🤝 Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 💬 Issues: GitHub Issues
- 💡 Feature Requests: GitHub Discussions

## Example Output

### Successful Deployment

```
CloudOne CLI - Deploy Application
──────────────────────────────────

ℹ Using current repository: username/my-repo

Deployment configuration:
  Repository:  https://github.com/username/my-repo
  Subdomain:   myapp

? Start deployment? Yes

✓ Connected to CloudOne
✓ Deployment started

Deployment in progress...
This may take several minutes...
──────────────────────────────────────────────────────
ℹ Cloning repository...
ℹ Installing dependencies...
ℹ Building application...
ℹ Configuring nginx...
ℹ Generating SSL certificate...

🚀 Deployment successful!

   URL: https://myapp.cloudone.dev

  Project ID:  507f1f77bcf86cd799439011
  Subdomain:   myapp
  Port:        3001
  Status:      deployed
```

Happy deploying! 🚀
