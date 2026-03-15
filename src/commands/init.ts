import { Command } from 'commander';
import { AuthService } from '../services/auth';
import { GitService } from '../services/git';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';

export function createInitCommand(): Command {
  const command = new Command('init');

  command
    .description('Initialize CloudOne project in current directory')
    .action(async () => {
      try {
        // Check authentication
        await AuthService.requireAuth();

        Logger.header('Initialize CloudOne Project');

        // Check if git is installed
        const isGitInstalled = await GitService.isGitInstalled();
        if (!isGitInstalled) {
          Logger.error('Git is not installed. Please install Git first.');
          process.exit(1);
        }

        // Check if current directory is a git repository
        const isGitRepo = await GitService.isGitRepository();
        if (!isGitRepo) {
          Logger.error('Current directory is not a Git repository.');
          Logger.info('Please run: git init');
          process.exit(1);
        }

        // Get repository info
        const repoInfo = await GitService.getRepositoryInfo();
        if (!repoInfo) {
          Logger.error('Could not detect repository information.');
          Logger.info('Make sure you have a remote origin configured.');
          process.exit(1);
        }

        // Detect framework
        const spinner = Logger.spinner('Detecting project framework...');
        const framework = await GitService.detectFramework();
        spinner.succeed(`Framework detected: ${framework}`);

        // Save project config
        await ConfigManager.saveProjectConfig({
          framework,
          repoOwner: repoInfo.owner,
          repoName: repoInfo.repo,
        });

        Logger.newLine();
        Logger.success('Project initialized successfully!');
        Logger.newLine();
        Logger.table([
          { key: 'Repository', value: `${repoInfo.owner}/${repoInfo.repo}` },
          { key: 'Branch', value: repoInfo.branch },
          { key: 'Framework', value: framework },
        ]);
        Logger.newLine();
        Logger.info('Next steps:');
        Logger.log('  • cloudone repositories  - View your repositories');
        Logger.log('  • cloudone start-review  - Start code review');
        Logger.log('  • cloudone deploy        - Deploy your application');
        Logger.newLine();

      } catch (error: any) {
        Logger.error(`Initialization failed: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}
