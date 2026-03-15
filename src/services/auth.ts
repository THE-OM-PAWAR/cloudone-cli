import open from 'open';
import axios from 'axios';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';
import { ApiService } from './api';

export class AuthService {
  /**
   * Initiate login flow with backend
   */
  static async login(apiUrl?: string): Promise<void> {
    try {
      // Update API URL if provided
      if (apiUrl) {
        await ConfigManager.updateConfig({ apiUrl });
      }

      const baseUrl = apiUrl || await ConfigManager.getApiUrl();
      
      Logger.newLine();
      const initSpinner = Logger.spinner('Initializing authentication...');

      // Step 1: Initialize authentication with backend
      const initResponse = await axios.post(`${baseUrl}/api/cli/auth/init`);
      const { sessionId, loginUrl } = initResponse.data;

      initSpinner.succeed('Authentication initialized');
      
      // Step 2: Open browser
      Logger.newLine();
      const browserSpinner = Logger.spinner('Opening browser...');
      await open(loginUrl);
      browserSpinner.succeed('Browser opened');

      Logger.newLine();
      Logger.info('Please complete authentication in your browser');
      Logger.newLine();

      // Step 3: Poll for authentication status
      const pollSpinner = Logger.spinner('Waiting for authentication...');
      
      const token = await this.pollForToken(baseUrl, sessionId);
      
      if (!token) {
        pollSpinner.fail('Authentication timeout');
        throw new Error('Authentication timed out. Please try again.');
      }

      pollSpinner.succeed('Authentication completed!');

      // Step 4: Save token
      await ConfigManager.updateConfig({ token });

      Logger.newLine();
      Logger.success('You are now logged in to CloudOne');
      Logger.newLine();

    } catch (error: any) {
      Logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Poll backend for authentication token
   */
  private static async pollForToken(baseUrl: string, sessionId: string): Promise<string | null> {
    const maxAttempts = 60; // 2 minutes (60 * 2 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${baseUrl}/api/cli/auth/status`, {
          params: { sessionId }
        });

        const { status, token } = response.data;

        if (status === 'authenticated' && token) {
          return token;
        }

        if (status === 'expired') {
          throw new Error('Authentication session expired');
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;

      } catch (error: any) {
        if (error.message === 'Authentication session expired') {
          throw error;
        }
        // Continue polling on other errors
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    return null;
  }

  /**
   * Save authentication token
   */
  static async saveToken(token: string): Promise<void> {
    const spinner = Logger.spinner('Verifying token...');

    try {
      // Save token
      await ConfigManager.updateConfig({ token });

      // Verify token with API
      const api = await ApiService.create();
      const isValid = await api.verifyAuth();

      if (!isValid) {
        await ConfigManager.clearConfig();
        spinner.fail('Invalid token');
        throw new Error('Token verification failed');
      }

      spinner.succeed('Authentication successful!');
      Logger.newLine();
      Logger.success('You are now logged in to CloudOne');
      Logger.newLine();

    } catch (error: any) {
      spinner.fail('Authentication failed');
      Logger.error(error.message);
      throw error;
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    await ConfigManager.clearConfig();
    Logger.success('Logged out successfully');
  }

  /**
   * Check authentication status
   */
  static async checkAuth(): Promise<boolean> {
    const isAuthenticated = await ConfigManager.isAuthenticated();
    
    if (!isAuthenticated) {
      Logger.error('Not authenticated. Please run: cloudone login');
      return false;
    }

    return true;
  }

  /**
   * Require authentication (throws if not authenticated)
   */
  static async requireAuth(): Promise<void> {
    const isAuthenticated = await this.checkAuth();
    
    if (!isAuthenticated) {
      process.exit(1);
    }
  }
}
