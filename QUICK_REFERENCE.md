# CloudOne CLI - Quick Reference Card

## Installation

```bash
npm install -g cloudone-cli
```

## Authentication

```bash
cloudone login                    # Open browser for auth
cloudone auth:token <token>       # Save token
cloudone logout                   # Logout
```

## Project Management

```bash
cloudone init                     # Initialize project
cloudone repositories             # List repositories
cloudone repos                    # Alias
```

## Code Review

```bash
cloudone start-review             # Start review (current dir)
cloudone start-review -r owner/repo  # Review specific repo
cloudone code-fix                 # Apply fixes
cloudone code-fix -r <reviewId>   # Apply specific review
cloudone code-fix --no-commit     # Don't commit
cloudone code-fix --no-push       # Don't push
```

## Deployment

```bash
cloudone deploy                   # Deploy current dir
cloudone deploy -s myapp          # Custom subdomain
cloudone deploy -r owner/repo     # Deploy specific repo
cloudone deployments              # List deployments
cloudone ls                       # Alias
```

## Configuration

### Global Config
`~/.cloudone/config.json`

### Project Config
`.cloudone` (in project root)

### Environment
```bash
export CLOUDONE_API_URL=https://api.cloudone.dev
```

## Common Workflows

### First Time Setup
```bash
cloudone login
cloudone auth:token <TOKEN>
cd my-project
cloudone init
cloudone deploy -s myapp
```

### Deploy Existing Project
```bash
cd my-project
cloudone init
cloudone deploy
```

### Code Review & Fix
```bash
cd my-project
cloudone start-review
cloudone code-fix
git push
```

## Troubleshooting

### Not Authenticated
```bash
cloudone logout
cloudone login
```

### Git Not Found
Install Git from https://git-scm.com/

### Connection Refused
```bash
# Check backend is running
curl http://localhost:3000/api/health
```

## Help

```bash
cloudone --help              # Show all commands
cloudone <command> --help    # Command help
cloudone --version           # Show version
```

## API Endpoints

```
POST /api/cli/token          # Generate token
GET  /api/github/repos       # List repos
POST /api/review/start       # Start review
POST /api/review/fix         # Apply fixes
POST /api/deploy             # Deploy app
GET  /api/deploy             # List deployments
```

## WebSocket Events

```
review:progress              # Review updates
review:complete              # Review done
fix:file                     # Generated file
fix:complete                 # Fix done
deployment:log               # Deploy logs
deployment:complete          # Deploy done
```

## Exit Codes

```
0 - Success
1 - Error
```

## Support

- Docs: `cloudone --help`
- Issues: GitHub Issues
- Guide: README.md
