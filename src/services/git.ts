import execa from 'execa';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Logger } from '../utils/logger';

export class GitService {
  /**
   * Check if git is installed
   */
  static async isGitInstalled(): Promise<boolean> {
    try {
      await execa('git', ['--version']);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if current directory is a git repository
   */
  static async isGitRepository(): Promise<boolean> {
    try {
      await execa('git', ['rev-parse', '--git-dir']);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current repository URL
   */
  static async getRepositoryUrl(): Promise<string | null> {
    try {
      const { stdout } = await execa('git', ['config', '--get', 'remote.origin.url']);
      return stdout.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current branch
   */
  static async getCurrentBranch(): Promise<string | null> {
    try {
      const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
      return stdout.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse GitHub URL to get owner and repo name
   */
  static parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const patterns = [
      /github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/,
      /github\.com\/([^/]+)\/([^/]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', ''),
        };
      }
    }

    return null;
  }

  /**
   * Clone repository
   */
  static async cloneRepository(url: string, destination: string): Promise<void> {
    await execa('git', ['clone', url, destination]);
  }

  /**
   * Add files to git
   */
  static async addFiles(files: string[] = ['.']): Promise<void> {
    await execa('git', ['add', ...files]);
  }

  /**
   * Commit changes
   */
  static async commit(message: string): Promise<void> {
    await execa('git', ['commit', '-m', message]);
  }

  /**
   * Pull changes
   */
  static async pull(branch?: string): Promise<void> {
    const args = ['pull'];
    if (branch) {
      args.push('origin', branch);
    }
    await execa('git', args);
  }

  /**
   * Push changes
   */
  static async push(branch?: string): Promise<void> {
    const args = ['push'];
    if (branch) {
      args.push('origin', branch);
    }
    await execa('git', args);
  }

  /**
   * Check if there are uncommitted changes
   */
  static async hasUncommittedChanges(): Promise<boolean> {
    try {
      const { stdout } = await execa('git', ['status', '--porcelain']);
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get repository info from current directory
   */
  static async getRepositoryInfo(): Promise<{
    url: string;
    owner: string;
    repo: string;
    branch: string;
  } | null> {
    const url = await this.getRepositoryUrl();
    const branch = await this.getCurrentBranch();

    if (!url || !branch) {
      return null;
    }

    const parsed = this.parseGitHubUrl(url);
    if (!parsed) {
      return null;
    }

    return {
      url,
      owner: parsed.owner,
      repo: parsed.repo,
      branch,
    };
  }

  /**
   * Detect project framework
   */
  static async detectFramework(): Promise<string> {
    const cwd = process.cwd();

    // Check for package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps['next']) return 'nextjs';
      if (deps['react']) return 'react';
      if (deps['vue']) return 'vue';
      if (deps['express']) return 'node';
    }

    // Check for requirements.txt (Python)
    if (await fs.pathExists(path.join(cwd, 'requirements.txt'))) {
      return 'python';
    }

    // Check for go.mod (Go)
    if (await fs.pathExists(path.join(cwd, 'go.mod'))) {
      return 'go';
    }

    return 'auto';
  }
}
