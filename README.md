# CloudOne CLI

Official command-line interface for CloudOne platform. Deploy and manage your applications from the terminal.

## Installation

```bash
npm install -g cloudone-cli
```

## Quick Start

### 1. Login to CloudOne

```bash
cloudone login
```

This will open your browser for authentication. After logging in, you'll receive a token.

### 2. Save Your Token

```bash
cloudone auth:token <YOUR_TOKEN>
```

### 3. Initialize Your Project

Navigate to your project directory and run:

```bash
cd my-project
cloudone init
```

### 4. Deploy Your Application

```bash
cloudone deploy --subdomain myapp
```

## Commands

### Authentication

#### `cloudone login`
Open browser for authentication.

Options:
- `-u, --url <url>` - API URL (default: http://localhost:3000)

#### `cloudone auth:token <token>`
Save authentication token from browser.

#### `cloudone logout`
Logout from CloudOne platform.

### Project Management

#### `cloudone init`
Initialize CloudOne project in current directory.

Detects:
- Git repository information
- Project framework (Next.js, React, Node.js, Python, etc.)
- Creates `.cloudone` configuration file

#### `cloudone repositories` (alias: `repos`)
List and select GitHub repositories.

Features:
- Browse all your GitHub repositories
- View repository details
- Quick actions for review and deployment

### Code Review

#### `cloudone start-review`
Start AI code review for a repository.

Options:
- `-r, --repo <repo>` - Repository in format `owner/repo`

Example:
```bash
cloudone start-review --repo username/my-repo
```

#### `cloudone code-fix`
Apply AI-generated code fixes.

Options:
- `-r, --review <reviewId>` - Review ID
- `--no-commit` - Do not commit changes
- `--no-push` - Do not push changes

Example:
```bash
cloudone code-fix --review 507f1f77bcf86cd799439011
```

### Deployment

#### `cloudone deploy`
Deploy application to CloudOne.

Options:
- `-r, --repo <repo>` - Repository URL or owner/repo
- `-s, --subdomain <subdomain>` - Custom subdomain

Examples:
```bash
# Deploy current directory
cloudone deploy --subdomain myapp

# Deploy specific repository
cloudone deploy --repo username/my-repo --subdomain myapp

# Deploy with auto-generated subdomain
cloudone deploy --repo https://github.com/username/my-repo
```

#### `cloudone deployments` (alias: `ls`)
List all your deployments.

## Configuration

### Global Configuration

Stored in `~/.cloudone/config.json`:

```json
{
  "token": "your-auth-token",
  "apiUrl": "https://api.cloudone.dev",
  "userId": "user-id",
  "email": "user@example.com"
}
```

### Project Configuration

Stored in `.cloudone` file in your project root:

```json
{
  "projectId": "project-id",
  "framework": "nextjs",
  "subdomain": "myapp",
  "repoOwner": "username",
  "repoName": "my-repo"
}
```

## Environment Variables

- `CLOUDONE_API_URL` - Override default API URL

## Real-time Features

The CLI uses WebSocket connections for real-time updates during:
- Code review progress
- Deployment logs
- Build status

## Error Handling

The CLI provides helpful error messages:

```bash
# Not authenticated
✗ Not authenticated. Please run: cloudone login

# Invalid subdomain
✗ Invalid subdomain. Use only lowercase letters, numbers, and hyphens.

# Git not installed
✗ Git is not installed. Please install Git first.
```

## Examples

### Complete Workflow

```bash
# 1. Login
cloudone login
cloudone auth:token abc123...

# 2. Initialize project
cd my-project
cloudone init

# 3. Start code review
cloudone start-review

# 4. Apply fixes
cloudone code-fix

# 5. Deploy
cloudone deploy --subdomain myapp

# 6. View deployments
cloudone deployments
```

### Deploy from GitHub

```bash
# Browse repositories
cloudone repositories

# Deploy selected repository
cloudone deploy --repo username/my-repo --subdomain myapp
```

## Troubleshooting

### Authentication Issues

```bash
# Clear config and re-login
cloudone logout
cloudone login
```

### Git Issues

```bash
# Ensure git is installed
git --version

# Ensure remote is configured
git remote -v
```

### API Connection Issues

```bash
# Use custom API URL
cloudone login --url https://api.cloudone.dev
```

## Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/cloudone/cli.git
cd cli

# Install dependencies
npm install

# Build
npm run build

# Link locally
npm link
```

### Watch Mode

```bash
npm run dev
```

## Support

- Documentation: https://docs.cloudone.dev
- Issues: https://github.com/cloudone/cli/issues
- Discord: https://discord.gg/cloudone

## License

MIT
