# Backend Integration Guide

This document explains how to integrate the CloudOne CLI with your existing backend.

## Required Backend Changes

### 1. CLI Authentication Endpoint

Add a new route for CLI authentication in your backend.

#### Create CLI Auth Controller

Create `cloud-plateform-backend/src/controllers/cli.controller.js`:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

class CliController {
  /**
   * Generate CLI token for authenticated user
   */
  async generateToken(req, res) {
    try {
      const { clerkId } = req.user;

      // Find user
      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate long-lived token (30 days)
      const token = jwt.sign(
        {
          sub: clerkId,
          userId: user._id,
          email: user.email,
          type: 'cli'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });

    } catch (error) {
      console.error('CLI token generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate CLI token',
        error: error.message
      });
    }
  }
}

module.exports = new CliController();
```

#### Create CLI Routes

Create `cloud-plateform-backend/src/routes/cli.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const cliController = require('../controllers/cli.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Generate CLI token (requires authentication)
router.post('/token', authMiddleware, cliController.generateToken);

module.exports = router;
```

#### Register Routes

In `cloud-plateform-backend/src/app.js` or `server.js`, add:

```javascript
const cliRoutes = require('./src/routes/cli.routes');

// ... other routes

app.use('/api/cli', cliRoutes);
```

### 2. CLI Authentication Page

Create a frontend page for CLI authentication at `/cli-auth`.

#### Create CLI Auth Page

Create `cloud-plateform-frontend/src/pages/CliAuth.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Copy, Terminal } from 'lucide-react';

export default function CliAuth() {
  const { getToken, isSignedIn } = useAuth();
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isSignedIn) {
      generateToken();
    }
  }, [isSignedIn]);

  const generateToken = async () => {
    setLoading(true);
    setError('');

    try {
      const clerkToken = await getToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cli/token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`
          }
        }
      );

      setToken(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>CLI Authentication</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            <CardTitle>CloudOne CLI Authentication</CardTitle>
          </div>
          <CardDescription>
            Use this token to authenticate the CloudOne CLI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {token && (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Token generated successfully! Copy it and use in your terminal.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your CLI Token</label>
                <div className="flex gap-2">
                  <Input
                    value={token}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyToken} variant="outline">
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Run this command in your terminal:</p>
                <code className="text-sm">cloudone auth:token {token}</code>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Copy the token above</li>
                  <li>Open your terminal</li>
                  <li>Run: <code className="bg-gray-100 px-1 rounded">cloudone auth:token YOUR_TOKEN</code></li>
                  <li>Start using CloudOne CLI!</li>
                </ol>
              </div>
            </>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Generating token...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Add Route

In `cloud-plateform-frontend/src/App.tsx`, add the route:

```typescript
import CliAuth from './pages/CliAuth';

// ... in your routes
<Route path="/cli-auth" element={<CliAuth />} />
```

### 3. Update Authentication Middleware

The existing `authMiddleware.js` should support both Clerk tokens and CLI JWT tokens.

Update `cloud-plateform-backend/src/middlewares/authMiddleware.js`:

```javascript
const { clerkClient } = require('@clerk/clerk-sdk-node');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7);

    // Try to verify as CLI token first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      if (decoded.type === 'cli') {
        // CLI token
        const user = await User.findOne({ clerkId: decoded.sub });
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          });
        }

        req.user = {
          id: user._id,
          clerkId: user.clerkId,
          email: user.email,
          name: user.name
        };

        return next();
      }
    } catch (jwtError) {
      // Not a CLI token, try Clerk token
    }

    // Verify as Clerk token
    const sessionClaims = await clerkClient.verifyToken(token);
    
    if (!sessionClaims) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    const clerkUser = await clerkClient.users.getUser(sessionClaims.sub);
    
    let user = await User.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
      });
    }

    req.user = {
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.reason === 'token-expired') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please refresh and try again.',
        code: 'TOKEN_EXPIRED',
        error: error.message 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed',
      code: 'AUTH_FAILED',
      error: error.message 
    });
  }
};

module.exports = authMiddleware;
```

### 4. Environment Variables

Add to `.env`:

```env
# JWT Secret for CLI tokens
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Testing the Integration

### 1. Start Backend

```bash
cd cloud-plateform-backend
npm run dev
```

### 2. Start Frontend

```bash
cd cloud-plateform-frontend
npm run dev
```

### 3. Test CLI Authentication

```bash
# Install CLI
cd cli
npm install
npm run build
npm link

# Test login
cloudone login

# Browser opens to http://localhost:5173/cli-auth
# Copy token and run:
cloudone auth:token <YOUR_TOKEN>

# Test API connection
cloudone repositories
```

## WebSocket Events

The CLI listens for these WebSocket events:

### Review Events
- `review:progress` - Review progress updates
- `review:complete` - Review completed
- `review:error` - Review failed

### Fix Events
- `fix:progress` - Fix progress updates
- `fix:file` - Generated file
- `fix:complete` - Fix completed
- `fix:error` - Fix failed

### Deployment Events
- `deployment:progress` - Deployment progress
- `deployment:log` - Deployment logs
- `deployment:complete` - Deployment completed
- `deployment:error` - Deployment failed

Make sure your backend emits these events via Socket.IO.

## Security Considerations

1. Use strong JWT secrets in production
2. Set appropriate token expiration times
3. Implement token refresh mechanism
4. Rate limit CLI endpoints
5. Log CLI authentication attempts
6. Validate all CLI inputs on backend

## Support

For issues or questions:
- Backend: Check `cloud-plateform-backend/README.md`
- Frontend: Check `cloud-plateform-frontend/README.md`
- CLI: Check `cli/README.md`
