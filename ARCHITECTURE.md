# CloudOne CLI - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER TERMINAL                            │
│                                                                   │
│  $ cloudone login                                                │
│  $ cloudone deploy --subdomain myapp                             │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDONE CLI                                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Commands   │  │   Services   │  │   Utilities  │          │
│  │              │  │              │  │              │          │
│  │ • login      │  │ • api        │  │ • config     │          │
│  │ • init       │  │ • auth       │  │ • logger     │          │
│  │ • repos      │  │ • git        │  │              │          │
│  │ • review     │  │              │  │              │          │
│  │ • fix        │  │              │  │              │          │
│  │ • deploy     │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDONE BACKEND                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Endpoints                          │   │
│  │                                                            │   │
│  │  POST /api/cli/token          - Generate CLI token       │   │
│  │  GET  /api/github/repos       - List repositories        │   │
│  │  POST /api/review/start       - Start code review        │   │
│  │  POST /api/review/fix         - Apply fixes              │   │
│  │  POST /api/deploy             - Deploy application       │   │
│  │  GET  /api/deploy             - List deployments         │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  WebSocket Events                         │   │
│  │                                                            │   │
│  │  review:progress              - Review updates           │   │
│  │  fix:file                     - Generated files          │   │
│  │  deployment:log               - Deployment logs          │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDONE FRONTEND                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              /cli-auth Page                               │   │
│  │                                                            │   │
│  │  1. User authenticates with Clerk                        │   │
│  │  2. Generate CLI token via API                           │   │
│  │  3. Display token to user                                │   │
│  │  4. User copies token to terminal                        │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Layer                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    cli.ts                               │     │
│  │  • Main entry point                                     │     │
│  │  • Command registration                                 │     │
│  │  • Argument parsing                                     │     │
│  └────────────────────────────────────────────────────────┘     │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                  Commands Layer                         │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │                                                          │     │
│  │  login.ts        - Authentication commands             │     │
│  │  init.ts         - Project initialization              │     │
│  │  repositories.ts - Repository management               │     │
│  │  review.ts       - Code review                         │     │
│  │  fix.ts          - Code fixes                          │     │
│  │  deploy.ts       - Deployment                          │     │
│  │                                                          │     │
│  └────────────────────────────────────────────────────────┘     │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                  Services Layer                         │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │                                                          │     │
│  │  api.ts          - HTTP client & API calls             │     │
│  │  auth.ts         - Authentication logic                │     │
│  │  git.ts          - Git operations                      │     │
│  │                                                          │     │
│  └────────────────────────────────────────────────────────┘     │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                  Utilities Layer                        │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │                                                          │     │
│  │  config.ts       - Configuration management            │     │
│  │  logger.ts       - Terminal output & styling           │     │
│  │                                                          │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                                    ┌──────────┐
│          │  1. cloudone login                                 │          │
│   User   │ ──────────────────────────────────────────────────▶│   CLI    │
│          │                                                    │          │
└──────────┘                                                    └────┬─────┘
                                                                     │
                                                                     │ 2. Open browser
                                                                     ▼
┌──────────┐                                                    ┌──────────┐
│          │  3. Navigate to /cli-auth                          │          │
│ Browser  │ ◀──────────────────────────────────────────────────│   CLI    │
│          │                                                    │          │
└────┬─────┘                                                    └──────────┘
     │
     │ 4. Authenticate with Clerk
     ▼
┌──────────┐                                                    ┌──────────┐
│          │  5. POST /api/cli/token                            │          │
│ Frontend │ ──────────────────────────────────────────────────▶│ Backend  │
│          │                                                    │          │
└────┬─────┘                                                    └────┬─────┘
     │                                                               │
     │                                                               │ 6. Generate JWT
     │                                                               ▼
     │                                                          ┌──────────┐
     │  7. Display token                                        │   JWT    │
     │ ◀────────────────────────────────────────────────────────│  Token   │
     │                                                          │          │
     ▼                                                          └──────────┘
┌──────────┐
│          │  8. Copy token
│   User   │
│          │
└────┬─────┘
     │
     │ 9. cloudone auth:token <TOKEN>
     ▼
┌──────────┐                                                    ┌──────────┐
│          │  10. Save to ~/.cloudone/config.json               │          │
│   CLI    │ ──────────────────────────────────────────────────▶│  Config  │
│          │                                                    │   File   │
└──────────┘                                                    └──────────┘
```

## Deployment Flow

```
┌──────────┐
│   User   │  cloudone deploy --subdomain myapp
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                         CLI                                   │
│                                                               │
│  1. Validate authentication                                  │
│  2. Get repository info                                      │
│  3. Validate subdomain                                       │
│  4. Connect WebSocket                                        │
│  5. POST /api/deploy                                         │
│                                                               │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                       Backend                                 │
│                                                               │
│  1. Create project in database                               │
│  2. Return deployment ID                                     │
│  3. Start deployment async                                   │
│                                                               │
│  Deployment Steps:                                           │
│  ├─ Clone repository                                         │
│  ├─ Detect framework                                         │
│  ├─ Install dependencies                                     │
│  ├─ Build application                                        │
│  ├─ Configure nginx                                          │
│  ├─ Generate SSL certificate                                 │
│  └─ Start application                                        │
│                                                               │
│  WebSocket Events:                                           │
│  ├─ deployment:progress                                      │
│  ├─ deployment:log                                           │
│  └─ deployment:complete                                      │
│                                                               │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                         CLI                                   │
│                                                               │
│  1. Display real-time logs                                   │
│  2. Show progress updates                                    │
│  3. Display deployment URL                                   │
│                                                               │
│  Output:                                                     │
│  ✓ Connected to CloudOne                                    │
│  ✓ Deployment started                                       │
│  ℹ Cloning repository...                                    │
│  ℹ Installing dependencies...                               │
│  ℹ Building application...                                  │
│  🚀 Deployment successful!                                  │
│     URL: https://myapp.cloudone.dev                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Code Review Flow

```
┌──────────┐
│   User   │  cloudone start-review
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                         CLI                                   │
│                                                               │
│  1. Detect repository from current directory                 │
│  2. Connect WebSocket                                        │
│  3. POST /api/review/start                                   │
│                                                               │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                       Backend                                 │
│                                                               │
│  1. Clone repository                                         │
│  2. Scan files                                               │
│  3. Analyze with AI                                          │
│  4. Generate review                                          │
│                                                               │
│  WebSocket Events:                                           │
│  ├─ review:progress - "Scanning repository..."              │
│  ├─ review:progress - "Analyzing code..."                   │
│  └─ review:complete - Review data                           │
│                                                               │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                         CLI                                   │
│                                                               │
│  1. Display progress updates                                 │
│  2. Show review summary                                      │
│  3. Suggest next step (code-fix)                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Data                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Global Config (~/.cloudone/config.json)                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  {                                                  │    │
│  │    "token": "jwt-token",                           │    │
│  │    "apiUrl": "http://localhost:3000",              │    │
│  │    "userId": "user-id",                            │    │
│  │    "email": "user@example.com"                     │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Project Config (.cloudone)                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  {                                                  │    │
│  │    "projectId": "project-id",                      │    │
│  │    "framework": "nextjs",                          │    │
│  │    "subdomain": "myapp",                           │    │
│  │    "repoOwner": "username",                        │    │
│  │    "repoName": "repo-name"                         │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      API Communication                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Request:                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  POST /api/deploy                                  │    │
│  │  Headers:                                           │    │
│  │    Authorization: Bearer <jwt-token>               │    │
│  │  Body:                                              │    │
│  │    {                                                │    │
│  │      "repoUrl": "https://github.com/user/repo",    │    │
│  │      "siteName": "myapp"                           │    │
│  │    }                                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Response:                                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  {                                                  │    │
│  │    "status": "started",                            │    │
│  │    "deploymentId": "deploy_123",                   │    │
│  │    "projectId": "507f1f77bcf86cd799439011"         │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                      Error Flow                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CLI Command                                                 │
│       │                                                      │
│       ├─ Try                                                 │
│       │   └─ Execute command logic                          │
│       │                                                      │
│       └─ Catch                                               │
│           ├─ Log error with logger.error()                  │
│           ├─ Display user-friendly message                  │
│           └─ Exit with code 1                               │
│                                                              │
│  API Service                                                 │
│       │                                                      │
│       ├─ Request Interceptor                                │
│       │   └─ Add auth token                                 │
│       │                                                      │
│       └─ Response Interceptor                               │
│           ├─ 401: Show "Please login" message               │
│           ├─ 404: Show "Not found" message                  │
│           ├─ 500: Show "Server error" message               │
│           └─ Network: Show "Connection failed" message      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Token Storage                                            │
│     ├─ Stored in ~/.cloudone/config.json                    │
│     ├─ File permissions: 600 (user only)                    │
│     └─ Never logged or displayed                            │
│                                                              │
│  2. API Communication                                        │
│     ├─ HTTPS in production                                  │
│     ├─ Token in Authorization header                        │
│     └─ Request timeout: 30s                                 │
│                                                              │
│  3. Input Validation                                         │
│     ├─ Subdomain format validation                          │
│     ├─ Repository URL validation                            │
│     └─ Git command sanitization                             │
│                                                              │
│  4. Token Management                                         │
│     ├─ JWT with 30-day expiration                           │
│     ├─ Signed with secret key                               │
│     └─ Verified on each request                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Technology Stack                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Language & Runtime                                          │
│  ├─ TypeScript 5.3                                          │
│  └─ Node.js 16+                                             │
│                                                              │
│  CLI Framework                                               │
│  └─ Commander.js 11.1                                       │
│                                                              │
│  HTTP Client                                                 │
│  └─ Axios 1.6                                               │
│                                                              │
│  WebSocket Client                                            │
│  └─ Socket.IO Client 4.7                                    │
│                                                              │
│  Terminal UI                                                 │
│  ├─ Chalk 4.1 (colors)                                      │
│  ├─ Ora 5.4 (spinners)                                      │
│  └─ Inquirer 8.2 (prompts)                                  │
│                                                              │
│  File Operations                                             │
│  └─ fs-extra 11.2                                           │
│                                                              │
│  Process Execution                                           │
│  └─ Execa 5.1                                               │
│                                                              │
│  Browser Automation                                          │
│  └─ Open 8.4                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

This architecture provides a clean separation of concerns, robust error handling, and a great user experience!
