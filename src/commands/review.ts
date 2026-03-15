import { Command } from 'commander';
import inquirer from 'inquirer';
import { AuthService } from '../services/auth';
import { ApiService } from '../services/api';
import { GitService } from '../services/git';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';

export function createStartReviewCommand(): Command {
  const command = new Command('start-review');

  command
    .description('Start AI code review for a repository')
    .option('-r, --repo <repo>', 'Repository in format owner/repo')
    .action(async (options) => {
      try {
        // Check authentication
        await AuthService.requireAuth();

        Logger.header('AI Code Review');

        let repoOwner: string;
        let repoName: string;

        // Get repository info
        if (options.repo) {
          const parts = options.repo.split('/');
          if (parts.length !== 2) {
            Logger.error('Invalid repository format. Use: owner/repo');
            process.exit(1);
          }
          repoOwner = parts[0];
          repoName = parts[1];
        } else {
          // Try to get from current directory
          const repoInfo = await GitService.getRepositoryInfo();
          if (repoInfo) {
            repoOwner = repoInfo.owner;
            repoName = repoInfo.repo;
            Logger.info(`Using current repository: ${repoOwner}/${repoName}`);
          } else {
            Logger.error('Could not detect repository. Use --repo option.');
            process.exit(1);
          }
        }

        Logger.newLine();

        // Start review
        const spinner = Logger.spinner('Starting code review...');
        const api = await ApiService.create();
        const result = await api.startReview(repoOwner, repoName);
        spinner.succeed('Review started');

        Logger.newLine();
        Logger.info('Analyzing repository...');
        Logger.info('This may take a few minutes...');
        Logger.newLine();

        // Poll for completion
        const pollSpinner = Logger.spinner('Waiting for review to complete...');
        
        let reviewCompleted = false;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes (60 * 5 seconds)

        while (!reviewCompleted && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          try {
            const reviews = await api.getReviews();
            const latestReview = reviews.find((r: any) => 
              r.repoOwner === repoOwner && r.repoName === repoName
            );

            if (latestReview && latestReview.status === 'completed') {
              reviewCompleted = true;
              pollSpinner.succeed('Review completed!');
              
              Logger.newLine();
              Logger.success('Code review completed!');
              Logger.newLine();
              
              Logger.table([
                { key: 'Review ID', value: latestReview._id },
                { key: 'Repository', value: `${repoOwner}/${repoName}` },
                { key: 'Status', value: latestReview.status },
                { key: 'Tech Stack', value: latestReview.techStack || 'N/A' },
              ]);
              
              Logger.newLine();
              Logger.info('Next step: Apply code fixes');
              Logger.log(`  cloudone code-fix --review ${latestReview._id}`);
              Logger.newLine();
              
            } else if (latestReview && latestReview.status === 'failed') {
              pollSpinner.fail('Review failed');
              Logger.error('Code review failed. Please try again.');
              process.exit(1);
            }
          } catch (error) {
            // Continue polling on error
          }
          
          attempts++;
        }

        if (!reviewCompleted) {
          pollSpinner.fail('Review timeout');
          Logger.warn('Review is taking longer than expected.');
          Logger.info('Check status with: cloudone code-fix');
        }

      } catch (error: any) {
        Logger.error(`Review failed: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}
