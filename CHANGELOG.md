# Changelog

All notable changes to CloudOne CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-15

### Added
- Initial release of CloudOne CLI
- Authentication system with browser-based OAuth
- Project initialization with framework detection
- GitHub repository management
- AI-powered code review
- Automated code fix application
- One-command application deployment
- Real-time deployment logs via WebSocket
- Deployment listing and management
- Interactive terminal UI with chalk and ora
- Comprehensive error handling
- Configuration management (global and project-level)
- Git integration for repository operations
- TypeScript support with full type definitions

### Commands
- `cloudone login` - Authenticate with CloudOne
- `cloudone auth:token` - Save authentication token
- `cloudone logout` - Logout from platform
- `cloudone init` - Initialize project
- `cloudone repositories` - List GitHub repositories
- `cloudone start-review` - Start AI code review
- `cloudone code-fix` - Apply AI-generated fixes
- `cloudone deploy` - Deploy application
- `cloudone deployments` - List all deployments

### Documentation
- Complete README with examples
- Quick start guide
- Contributing guidelines
- Backend integration guide
- Implementation summary

## [Unreleased]

### Planned
- Deployment logs viewing
- Environment variable management
- Custom domain configuration
- Deployment rollback
- Application scaling
- Platform status checking
- Shell completion support
- Auto-update mechanism

---

For more information, see [README.md](./README.md)
