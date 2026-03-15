import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AuthService } from '../services/auth';
import { ApiService } from '../services/api';
import { GitService } from '../services/git';
import { Logger } from '../utils/logger';

export function createCodeFixCommand(): Command {
  const command = new Command('code-fix');

  command
    .description('Apply AI-generated code fixes')
    .option('-r, --review <reviewId>', 'Review ID')
    .option('--no-commit', 'Do not commit changes')
    .option('--no-push', 'Do not push changes')
    .action(async (options) => {
      try {
        // Check authentication
        await AuthService.requireAuth();

        Logger.header('AI Code Fix');

        // Get review ID
        let reviewId = options.review;
        const api = await ApiService.create();

        if (!reviewId) {
          // Fetch recent reviews
          const spinner = Logger.spinner('Fetching reviews...');
          const reviews = await api.getReviews();
          spinner.succeed(`Found ${reviews.length} reviews`);

          if (reviews.length === 0) {
            Logger.error('No reviews found. Run: cloudone start-review');
            process.exit(1);
          }

          // Filter to only show completed reviews
          const completedReviews = reviews.filter((r: any) => r.status === 'completed');
          
          if (completedReviews.length === 0) {
            Logger.error('No completed reviews found. Complete a review first.');
            process.exit(1);
          }

          const { selectedReview } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedReview',
              message: 'Select a review to fix:',
              choices: completedReviews.map((review: any) => ({
                name: `${review.repoOwner}/${review.repoName} - ${review.techStack}`,
                value: review._id,
              })),
            },
          ]);

          reviewId = selectedReview;
        }

        // Start fix process
        const spinner = Logger.spinner('Starting fix process...');
        await api.fixRepository(reviewId);
        spinner.succeed('Fix process started');

        Logger.newLine();
        Logger.info('Generating documentation files...');
        Logger.info('This may take a few minutes...');
        Logger.newLine();

        // Poll for completion
        const pollSpinner = Logger.spinner('Waiting for fix to complete...');
        
        let fixCompleted = false;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes (60 * 5 seconds)
        let generatedFiles: Array<{ name: string; content: string }> = [];

        while (!fixCompleted && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          try {
            const review = await api.getReview(reviewId);

            if (review.status === 'completed' && review.filesGenerated && review.filesGenerated.length > 0) {
              fixCompleted = true;
              generatedFiles = review.filesGenerated;
              pollSpinner.succeed('Fix completed!');
              
              Logger.newLine();
              Logger.success('Documentation files generated!');
              Logger.newLine();
              
              // Write files to disk
              const writeSpinner = Logger.spinner('Writing files...');
              
              for (const file of generatedFiles) {
                const filePath = path.join(process.cwd(), file.name);
                await fs.writeFile(filePath, file.content, 'utf-8');
              }
              
              writeSpinner.succeed(`Wrote ${generatedFiles.length} files`);
              Logger.newLine();

              generatedFiles.forEach(file => {
                Logger.log(`  • ${file.name}`);
              });
              Logger.newLine();

              Logger.info('✨ Files have been written locally and pushed to GitHub by the backend.');
              Logger.info('📦 Check your repository on GitHub to see the changes.');
              
              Logger.newLine();
              Logger.success('Code fix completed successfully!');
              Logger.newLine();
              
            } else if (review.status === 'failed') {
              pollSpinner.fail('Fix failed');
              Logger.error('Code fix failed. Please try again.');
              process.exit(1);
            }
          } catch (error) {
            // Continue polling on error
          }
          
          attempts++;
        }

        if (!fixCompleted) {
          pollSpinner.fail('Fix timeout');
          Logger.warn('Fix is taking longer than expected.');
          Logger.info('Files may have been pushed to your repository.');
          Logger.info('Check your GitHub repository for the generated files.');
        }

      } catch (error: any) {
        Logger.error(`Fix failed: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}
