import { Command } from 'commander';
import inquirer from 'inquirer';
import { AuthService } from '../services/auth';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';

export function createLoginCommand(): Command {
  const command = new Command('login');

  command
    .description('Authenticate with CloudOne platform')
    .option('-u, --url <url>', 'API URL (default: http://localhost:3000)')
    .action(async (options) => {
      try {
        Logger.header('CloudOne Authentication');

        // Check if already authenticated
        const isAuthenticated = await ConfigManager.isAuthenticated();
        if (isAuthenticated) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'You are already logged in. Do you want to login again?',
              default: false,
            },
          ]);

          if (!confirm) {
            Logger.info('Login cancelled');
            return;
          }
        }

        await AuthService.login(options.url);

      } catch (error: any) {
        Logger.error(`Login failed: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}

export function createAuthTokenCommand(): Command {
  const command = new Command('auth:token');

  command
    .description('Save authentication token')
    .argument('<token>', 'Authentication token from browser')
    .action(async (token: string) => {
      try {
        await AuthService.saveToken(token);
      } catch (error: any) {
        Logger.error(`Failed to save token: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}

export function createLogoutCommand(): Command {
  const command = new Command('logout');

  command
    .description('Logout from CloudOne platform')
    .action(async () => {
      try {
        await AuthService.logout();
      } catch (error: any) {
        Logger.error(`Logout failed: ${error.message}`);
        process.exit(1);
      }
    });

  return command;
}
