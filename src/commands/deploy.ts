import { Command } from 'commander';
import inquirer from 'inquirer';
import { AuthService } from '../services/auth';
import { ApiService } from '../services/api';
import { GitService } from '../services/git';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';
import { io, Socket } from 'socket.io-client';

export function createDeployCommand(): Command {
  const command = new Command('deploy');

  command
    .description('Deploy application to CloudOne')
    .option('-r, --repo <repo>', 'Repository URL or owner/repo')
    .option('-s, --subdomain <subdomain>', 'Custom subdomain')
    .action(async (options) => {
      try {
        // Check authentication
        await AuthService.requireAuth();

        Logger.header('Deploy Application');

        let repoUrl: string;
        let subdomain: string | undefined = options.subdomain;

        // Get repository URL
        if (options.repo) {
          // Check if it's a full URL or owner/repo format
          if (options.repo.startsWith('http')) {
            repoUrl = options.repo;
          } else {
            repoUrl = `https://github.com/${options.repo}`;
          }
        } else {
          // Try to get from current directory
          const repoInfo = await GitService.getRepositoryInfo();
          if (repoInfo) {
            repoUrl = repoInfo.url;
            Logger.info(`Using current repository: ${repoInfo.owner}/${repoInfo.repo}`);
          } else {
            Logger.error('Could not detect repository. Use --repo option.');
            process.exit(1);
          }
        }

        // Validate subdomain format
        if (subdomain && !/^[a-z0-9-]+$/.test(subdomain)) {
          Logger.error('Invalid subdomain. Use only lowercase letters, numbers, and hyphens.');
          process.exit(1);
        }

        // Ask for subdomain if not provided
        if (!subdomain) {
          const { inputSubdomain } = await inquirer.prompt([
            {
              type: 'input',
              name: 'inputSubdomain',
              message: 'Enter subdomain (leave empty for auto-generated):',
              validate: (input: string) => {
                if (!input) return true;
                if (!/^[a-z0-9-]+$/.test(input)) {
                  return 'Use only lowercase letters, numbers, and hyphens';
                }
                return true;
              },
            },
          ]);

          subdomain = inputSubdomain || undefined;
        }

        Logger.newLine();
        Logger.info('Deployment configuration:');
        Logger.table([
          { key: 'Repository', value: repoUrl },
          { key: 'Subdomain', value: subdomain || 'Auto-generated' },
        ]);
        Logger.newLine();

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Start deployment?',
            default: true,
          },
        ]);

        if (!confirm) {
          Logger.info('Deployment cancelled');
          return;
        }

        // Start deployment
        const spinner = Logger.spinner('Starting deployment...');
        const api = await ApiService.create();
        await api.deployApplication(repoUrl, subdomain);
        spinner.succeed('Deployment started');

        // Extract repo owner and name for polling
        const githubUrlRegex = /github\.com\/([^\/]+)\/([^\/\.]+)/;
        const match = repoUrl.match(githubUrlRegex);
        const repoOwner = match ? match[1] : '';
        const repoName = match ? match[2] : '';

        Logger.newLine();
        Logger.info('Deploying application...');
        Logger.info('This may take several minutes...');
        Logger.newLine();

        // Poll for completion using the same approach as review
        const pollSpinner = Logger.spinner('Waiting for deployment to complete...');
        
        let deploymentCompleted = false;
        let attempts = 0;
        const maxAttempts = 120; // 10 minutes (120 * 5 seconds)

        while (!deploymentCompleted && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          try {
            // Get all deployments and find the latest one for this repo
            const deployments = await api.getDeployments();
            const latestDeployment = deployments.find((d: any) => 
              d.repository === `${repoOwner}/${repoName}` || 
              d.name === (subdomain || repoName)
            );

            if (latestDeployment && latestDeployment.status === 'deployed') {
              deploymentCompleted = true;
              pollSpinner.succeed('Deployment completed!');
              
              Logger.newLine();
              Logger.success('🚀 Deployment successful!');
              Logger.newLine();
              
              Logger.deploymentUrl(latestDeployment.url);
              Logger.newLine();
              
              Logger.table([
                { key: 'Project ID', value: latestDeployment.id },
                { key: 'Subdomain', value: latestDeployment.subdomain },
                { key: 'Status', value: latestDeployment.status },
                { key: 'Repository', value: latestDeployment.repository || `${repoOwner}/${repoName}` },
              ]);
              
              Logger.newLine();
              
            } else if (latestDeployment && latestDeployment.status === 'failed') {
              pollSpinner.fail('Deployment failed');
              Logger.error('Deployment failed. Please try again.');
              process.exit(1);
            }
          } catch (error) {
            // Continue polling on error
          }
          
          attempts++;
        }

        if (!deploymentCompleted) {
          pollSpinner.fail('Deployment timeout');
          Logger.warn('Deployment is taking longer than expected.');
          Logger.info('Check status with: cloudone deployments');
        }

      } catch (error: any) {
        Logger.error(`Deployment failed: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}

export function createDeploymentsCommand(): Command {
  const command = new Command('deployments');

  command
    .description('List all deployments')
    .alias('ls')
    .action(async () => {
      try {
        await AuthService.requireAuth();

        Logger.header('Your Deployments');

        const spinner = Logger.spinner('Fetching deployments...');
        const api = await ApiService.create();
        const deployments = await api.getDeployments();
        spinner.succeed(`Found ${deployments.length} deployments`);

        if (deployments.length === 0) {
          Logger.warn('No deployments found');
          Logger.info('Deploy your first app: cloudone deploy');
          return;
        }

        Logger.newLine();

        deployments.forEach((deployment: any, index: number) => {
          const platformDomain = process.env.PLATFORM_DOMAIN || 'aitoyz.in';
          const url = `https://${deployment.subdomain}.${platformDomain}`;
          
          Logger.log(`${index + 1}. ${deployment.name}`);
          Logger.table([
            { key: '  Subdomain', value: deployment.subdomain },
            { key: '  Status', value: deployment.status },
            { key: '  URL', value: url },
            { key: '  Created', value: new Date(deployment.createdAt).toLocaleString() },
          ]);
          Logger.newLine();
        });

      } catch (error: any) {
        Logger.error(`Failed to fetch deployments: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}
