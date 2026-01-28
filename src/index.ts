#!/usr/bin/env node
import { Command } from 'commander';
import { quickSelect } from './ui/quick-select';
import { listProfiles, loadProfile, loadSettings, getCurrentProvider } from './lib/config/loader';
import { applyProfile, listBackups, restoreBackup } from './lib/config/writer';
import chalk from 'chalk';

const program = new Command();

program
  .name('cc-switch')
  .description('Quick Claude Code configuration switcher')
  .version('1.0.0');

program
  .action(async () => {
    await quickSelect();
  });

program
  .command('use <profile-id>')
  .description('Switch to a provider profile')
  .action(async (profileId: string) => {
    try {
      const profile = await loadProfile(profileId);
      await applyProfile(profile);
      console.log(chalk.green(`✓ Switched to ${profile.name}`));
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available profiles')
  .action(async () => {
    try {
      const profiles = await listProfiles();
      const settings = await loadSettings();
      const current = getCurrentProvider(settings);

      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles found. Create profiles in ~/.claude/profiles/'));
        return;
      }

      console.log(chalk.bold('Available Profiles:'));
      profiles.forEach(p => {
        const marker = p.id === current ? chalk.green('✓') : ' ';
        console.log(`  ${marker} ${p.icon || '📦'} ${chalk.bold(p.name)} (${chalk.gray(p.id)})`);
        if (p.description) console.log(`      ${p.description}`);
      });
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('current')
  .description('Show current configuration')
  .action(async () => {
    try {
      const settings = await loadSettings();
      const current = getCurrentProvider(settings);

      console.log(chalk.bold('Current Configuration:'));
      console.log(`  Provider: ${chalk.cyan(current || 'unknown')}`);
      console.log(`  Base URL: ${chalk.gray(settings.env?.ANTHROPIC_BASE_URL || 'default')}`);
      console.log(`  Haiku Model: ${chalk.gray(settings.env?.ANTHROPIC_DEFAULT_HAIKU_MODEL || 'default')}`);
      console.log(`  Sonnet Model: ${chalk.gray(settings.env?.ANTHROPIC_DEFAULT_SONNET_MODEL || 'default')}`);
      console.log(`  Opus Model: ${chalk.gray(settings.env?.ANTHROPIC_DEFAULT_OPUS_MODEL || 'default')}`);
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('history')
  .description('Show backup history')
  .action(async () => {
    try {
      const backups = await listBackups();
      if (backups.length === 0) {
        console.log(chalk.yellow('No backups found'));
        return;
      }
      console.log(chalk.bold('Backup History:'));
      backups.forEach((b, i) => console.log(`  ${chalk.gray(`${i + 1}.`)} ${b}`));
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('restore <backup-file>')
  .description('Restore from backup')
  .action(async (backupFile: string) => {
    try {
      await restoreBackup(backupFile);
      console.log(chalk.green(`✓ Restored from ${backupFile}`));
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse();
