# Contributing to CloudOne CLI

Thank you for your interest in contributing to CloudOne CLI!

## Development Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Git

### Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/your-username/cloudone-cli.git
cd cloudone-cli
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Link for local testing:
```bash
npm link
```

5. Test the CLI:
```bash
cloudone --help
```

## Project Structure

```
cli/
├── src/
│   ├── commands/       # Command implementations
│   │   ├── login.ts
│   │   ├── init.ts
│   │   ├── repositories.ts
│   │   ├── review.ts
│   │   ├── fix.ts
│   │   └── deploy.ts
│   ├── services/       # Service layer
│   │   ├── api.ts      # API client
│   │   ├── auth.ts     # Authentication
│   │   └── git.ts      # Git operations
│   ├── utils/          # Utilities
│   │   ├── config.ts   # Configuration management
│   │   └── logger.ts   # Logging utilities
│   ├── types/          # TypeScript types
│   └── cli.ts          # Main entry point
├── dist/               # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

### Watch Mode

Run TypeScript compiler in watch mode:
```bash
npm run dev
```

### Testing Changes

After making changes:
```bash
npm run build
cloudone <command>
```

### Adding a New Command

1. Create command file in `src/commands/`:
```typescript
import { Command } from 'commander';
import { Logger } from '../utils/logger';

export function createMyCommand(): Command {
  const command = new Command('mycommand');

  command
    .description('My command description')
    .action(async () => {
      try {
        Logger.info('Executing my command');
        // Implementation
      } catch (error: any) {
        Logger.error(error.message);
        process.exit(1);
      }
    });

  return command;
}
```

2. Register in `src/cli.ts`:
```typescript
import { createMyCommand } from './commands/mycommand';
program.addCommand(createMyCommand());
```

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Use async/await for asynchronous operations
- Handle errors gracefully

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

Examples:
```
feat: add deployment status command
fix: handle authentication timeout
docs: update README with examples
```

## Testing

### Manual Testing

Test common workflows:

```bash
# Authentication
cloudone login
cloudone auth:token <token>
cloudone logout

# Project initialization
cloudone init

# Repository management
cloudone repositories

# Code review
cloudone start-review
cloudone code-fix

# Deployment
cloudone deploy --subdomain test
cloudone deployments
```

### Error Scenarios

Test error handling:
- No authentication
- Invalid repository
- Network failures
- Invalid input

## Pull Request Process

1. Create a feature branch:
```bash
git checkout -b feature/my-feature
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat: add my feature"
```

3. Push to your fork:
```bash
git push origin feature/my-feature
```

4. Create a Pull Request with:
   - Clear description of changes
   - Screenshots/examples if applicable
   - Reference to related issues

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm

## Questions?

- Open an issue for bugs
- Start a discussion for feature requests
- Join our Discord for questions

Thank you for contributing! 🚀
