import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  /**
   * Success message
   */
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /**
   * Error message
   */
  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  /**
   * Warning message
   */
  static warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  /**
   * Info message
   */
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * Log message without icon
   */
  static log(message: string): void {
    console.log(message);
  }

  /**
   * Create a spinner
   */
  static spinner(text: string): Ora {
    return ora(text).start();
  }

  /**
   * Print a blank line
   */
  static newLine(): void {
    console.log();
  }

  /**
   * Print a header
   */
  static header(text: string): void {
    console.log();
    console.log(chalk.bold.cyan(text));
    console.log(chalk.cyan('─'.repeat(text.length)));
  }

  /**
   * Print deployment URL
   */
  static deploymentUrl(url: string): void {
    console.log();
    console.log(chalk.bold.green('🚀 Deployment successful!'));
    console.log();
    console.log(chalk.cyan('   URL:'), chalk.bold.underline(url));
    console.log();
  }

  /**
   * Print table-like data
   */
  static table(data: Array<{ key: string; value: string }>): void {
    const maxKeyLength = Math.max(...data.map(d => d.key.length));
    
    data.forEach(({ key, value }) => {
      const padding = ' '.repeat(maxKeyLength - key.length + 2);
      console.log(chalk.gray(key + ':') + padding + value);
    });
  }

  /**
   * Print a divider
   */
  static divider(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }
}
