import axios, { AxiosInstance, AxiosError } from 'axios';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await ConfigManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          Logger.error('Authentication failed. Please run: cloudone login');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize API service with config
   */
  static async create(): Promise<ApiService> {
    const apiUrl = await ConfigManager.getApiUrl();
    return new ApiService(apiUrl);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify authentication token
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/cli/github/repos');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get GitHub repositories
   */
  async getRepositories(): Promise<any[]> {
    const response = await this.client.get('/api/cli/github/repos');
    return response.data.repositories || [];
  }

  /**
   * Get repository branches
   */
  async getBranches(owner: string, repo: string): Promise<any[]> {
    const response = await this.client.get(`/api/cli/github/repos/${owner}/${repo}/branches`);
    return response.data.branches || [];
  }

  /**
   * Start code review
   */
  async startReview(repoOwner: string, repoName: string, socketId?: string): Promise<any> {
    const headers: any = {};
    if (socketId) {
      headers['x-socket-id'] = socketId;
    }

    const response = await this.client.post(
      '/api/cli/review/start',
      { repoOwner, repoName },
      { headers }
    );
    return response.data;
  }

  /**
   * Fix repository code
   */
  async fixRepository(reviewId: string, socketId?: string): Promise<any> {
    const headers: any = {};
    if (socketId) {
      headers['x-socket-id'] = socketId;
    }

    const response = await this.client.post(
      '/api/cli/review/fix',
      { reviewId },
      { headers }
    );
    return response.data;
  }

  /**
   * Get all reviews
   */
  async getReviews(): Promise<any[]> {
    const response = await this.client.get('/api/cli/review');
    return response.data.reviews || [];
  }

  /**
   * Get specific review
   */
  async getReview(reviewId: string): Promise<any> {
    const response = await this.client.get(`/api/cli/review/${reviewId}`);
    return response.data.review;
  }

  /**
   * Deploy application
   */
  async deployApplication(repoUrl: string, subdomain?: string, socketId?: string): Promise<any> {
    const headers: any = {};
    if (socketId) {
      headers['x-socket-id'] = socketId;
    }

    const response = await this.client.post(
      '/api/cli/deploy',
      { repoUrl, siteName: subdomain },
      { headers }
    );
    return response.data;
  }

  /**
   * Get all deployments
   */
  async getDeployments(): Promise<any[]> {
    const response = await this.client.get('/api/cli/deploy');
    return response.data.deployments || [];
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<any> {
    const response = await this.client.get(`/api/cli/deploy/status/${deploymentId}`);
    return response.data;
  }
}
