import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  token?: string;
  apiUrl?: string;
  userId?: string;
  email?: string;
}

export interface ProjectConfig {
  projectId?: string;
  framework?: string;
  subdomain?: string;
  repoOwner?: string;
  repoName?: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.cloudone');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const PROJECT_CONFIG_FILE = '.cloudone';

export class ConfigManager {
  /**
   * Ensure config directory exists
   */
  private static async ensureConfigDir(): Promise<void> {
    await fs.ensureDir(CONFIG_DIR);
  }

  /**
   * Get global config
   */
  static async getConfig(): Promise<Config> {
    try {
      await this.ensureConfigDir();
      
      if (await fs.pathExists(CONFIG_FILE)) {
        return await fs.readJson(CONFIG_FILE);
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Save global config
   */
  static async saveConfig(config: Config): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
  }

  /**
   * Update global config
   */
  static async updateConfig(updates: Partial<Config>): Promise<void> {
    const config = await this.getConfig();
    await this.saveConfig({ ...config, ...updates });
  }

  /**
   * Clear global config (logout)
   */
  static async clearConfig(): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeJson(CONFIG_FILE, {}, { spaces: 2 });
  }

  /**
   * Get auth token
   */
  static async getToken(): Promise<string | null> {
    const config = await this.getConfig();
    return config.token || null;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Get project config from current directory
   */
  static async getProjectConfig(): Promise<ProjectConfig> {
    try {
      const projectConfigPath = path.join(process.cwd(), PROJECT_CONFIG_FILE);
      
      if (await fs.pathExists(projectConfigPath)) {
        return await fs.readJson(projectConfigPath);
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Save project config to current directory
   */
  static async saveProjectConfig(config: ProjectConfig): Promise<void> {
    const projectConfigPath = path.join(process.cwd(), PROJECT_CONFIG_FILE);
    await fs.writeJson(projectConfigPath, config, { spaces: 2 });
  }

  /**
   * Update project config
   */
  static async updateProjectConfig(updates: Partial<ProjectConfig>): Promise<void> {
    const config = await this.getProjectConfig();
    await this.saveProjectConfig({ ...config, ...updates });
  }

  /**
   * Get API URL
   */
  static async getApiUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.apiUrl || process.env.CLOUDONE_API_URL || 'http://localhost:3000';
  }

  /**
   * Get config directory path
   */
  static getConfigDir(): string {
    return CONFIG_DIR;
  }

  /**
   * Get config file path
   */
  static getConfigFile(): string {
    return CONFIG_FILE;
  }
}
