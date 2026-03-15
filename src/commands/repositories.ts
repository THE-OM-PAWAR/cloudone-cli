import { Command } from 'commander';
import inquirer from 'inquirer';
import { AuthService } from '../services/auth';
import { ApiService } from '../services/api';
import { GitService } from '../services/git';
import { Logger } from '../utils/logger';

export function createRepositoriesCommand(): Command {
  const command = new Command('repositories');

  command
    .description('List and select GitHub repositories')
    .alias('repos')
    .action(async () => {
      try {
        // Check authentication
        await AuthService.requireAuth();

        Logger.header('GitHub Repositories');

        // Fetch repositories
        const spinner = Logger.spinner('Fetching repositories...');
        const api = await ApiService.create();
        const repositories = await api.getRepositories();
        spinner.succeed(`Found ${repositories.length} repositories`);

        if (repositories.length === 0) {
          Logger.warn('No repositories found.');
          Logger.info('Make sure you have connected your GitHub account.');
          return;
        }

        Logger.newLine();

        // Display repositories
        const choices = repositories.map((repo: any) => ({
          name: `${repo.fullName || repo.full_name} ${repo.private ? '(private)' : '(public)'}`,
          value: repo,
          short: repo.fullName || repo.full_name,
        }));

        const { selectedRepo } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedRepo',
            message: 'Select a repository:',
            choices,
            pageSize: 15,
          },
        ]);

        Logger.newLine();
        Logger.header('Repository Details');
        Logger.newLine();
        Logger.table([
          { key: 'Name', value: selectedRepo.fullName || selectedRepo.full_name || 'Unknown' },
          { key: 'Description', value: selectedRepo.description || 'No description' },
          { key: 'Language', value: selectedRepo.language || 'Unknown' },
          { key: 'Visibility', value: selectedRepo.private ? 'Private' : 'Public' },
          { key: 'Default Branch', value: selectedRepo.defaultBranch || selectedRepo.default_branch || 'main' },
          { key: 'Clone URL', value: selectedRepo.cloneUrl || selectedRepo.clone_url || 'N/A' },
        ]);
        Logger.newLine();

        // Clone the repository
        const repoName = selectedRepo.name;
        const cloneUrl = selectedRepo.cloneUrl || selectedRepo.clone_url;
        const cloneSpinner = Logger.spinner(`Cloning ${repoName}...`);

        try {
          await GitService.cloneRepository(cloneUrl, repoName);
          cloneSpinner.succeed(`Repository cloned to ./${repoName}`);
        } catch (error: any) {
          cloneSpinner.fail('Failed to clone repository');
          Logger.error(error.message);
          Logger.info('You can manually clone it with:');
          Logger.log(`  git clone ${cloneUrl}`);
          return;
        }

        Logger.newLine();

        // Ask what to do next
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do with this repository?',
            choices: [
              { name: 'Start code review', value: 'review' },
              { name: 'Deploy this repository', value: 'deploy' },
              { name: 'Initialize CloudOne project', value: 'init' },
              { name: 'Nothing, just cloned it', value: 'none' },
            ],
          },
        ]);

        const repoFullName = selectedRepo.fullName || selectedRepo.full_name;

        if (action === 'review') {
          Logger.newLine();
          Logger.info('Starting code review...');
          Logger.log(`  cd ${repoName}`);
          Logger.log(`  cloudone start-review`);
        } else if (action === 'deploy') {
          Logger.newLine();
          Logger.info('To deploy this repository:');
          Logger.log(`  cd ${repoName}`);
          Logger.log(`  cloudone deploy --subdomain ${repoName}`);
        } else if (action === 'init') {
          Logger.newLine();
          Logger.info('To initialize CloudOne:');
          Logger.log(`  cd ${repoName}`);
          Logger.log(`  cloudone init`);
        } else {
          Logger.newLine();
          Logger.success('Repository cloned successfully!');
          Logger.info(`Navigate to it with: cd ${repoName}`);
        }

      } catch (error: any) {
        Logger.error(`Failed to fetch repositories: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}
