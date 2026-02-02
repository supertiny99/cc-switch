#!/usr/bin/env node
import { Command } from 'commander';
import { quickSelect } from './ui/quick-select';
import { listProfiles, loadProfile, loadSettings, getCurrentProvider, getCurrentProfileId } from './lib/config/loader';
import { applyProfile, listBackups, restoreBackup, deleteProfile, updateProfile } from './lib/config/writer';
import { PROVIDER_PRESETS, createProfileFromPreset, saveProfile, profileExists, sanitizeId } from './lib/config/creator';
import chalk from 'chalk';
import prompts from 'prompts';

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
  .command('use')
  .description('Switch to a provider profile')
  .action(async () => {
    try {
      const profiles = await listProfiles();
      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles found. Run: cc-switch add'));
        return;
      }

      const settings = await loadSettings();
      const current = getCurrentProfileId(settings);

      const { profileId } = await prompts({
        type: 'select',
        name: 'profileId',
        message: 'Select profile:',
        choices: profiles.map(p => ({
          title: `${p.id === current ? '✓ ' : ''}${p.icon} ${p.name}`,
          description: p.description || p.id,
          value: p.id
        }))
      });

      if (!profileId) {
        console.log(chalk.yellow('Cancelled'));
        return;
      }

      const profile = await loadProfile(profileId);
      await applyProfile(profile);

      // Build detailed output
      const baseUrl = profile.config.env.ANTHROPIC_BASE_URL;
      const haikuModel = profile.config.env.ANTHROPIC_DEFAULT_HAIKU_MODEL;
      const sonnetModel = profile.config.env.ANTHROPIC_DEFAULT_SONNET_MODEL;
      const opusModel = profile.config.env.ANTHROPIC_DEFAULT_OPUS_MODEL;

      console.log('');
      console.log(chalk.green(`  ${profile.icon || '📦'} Switched to ${profile.name}`));
      console.log(chalk.gray('  ──────────────────────────────────────'));
      if (baseUrl) console.log(chalk.gray(`  Base URL:  ${baseUrl}`));
      if (haikuModel) console.log(chalk.gray(`  Haiku:    ${haikuModel}`));
      if (sonnetModel) console.log(chalk.gray(`  Sonnet:   ${sonnetModel}`));
      if (opusModel) console.log(chalk.gray(`  Opus:     ${opusModel}`));
      console.log('');
    } catch (err: any) {
      if (err.message === 'User cancelled') {
        console.log(chalk.yellow('Cancelled'));
        return;
      }
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
      const current = getCurrentProfileId(settings);

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
      const profileId = getCurrentProfileId(settings);

      // Try to find and display the full profile
      const profiles = await listProfiles();
      const currentProfile = profiles.find(p => p.id === profileId);

      console.log(chalk.bold('Current Configuration:'));

      if (currentProfile) {
        console.log(`  Profile: ${chalk.cyan(currentProfile.icon + ' ' + currentProfile.name)} (${chalk.gray(currentProfile.id)})`);
      } else {
        console.log(`  Profile: ${chalk.gray('unknown')}`);
      }

      console.log(`  Base URL: ${chalk.gray(settings.env?.ANTHROPIC_BASE_URL || 'default')}`);
      console.log(`  Haiku Model: ${chalk.gray(settings.env?.ANTHROPIC_DEFAULT_HAIKU_MODEL || 'default')}`);
      console.log(`  Sonnet Model: ${chalk.gray(settings.env?.ANTHROPIC_DEFAULT_SONNET_MODEL || 'default')}`);
      console.log(`  Opus Model: ${chalk.gray(settings.env?.ANTHROPIC_DEFAULT_OPUS_MODEL || 'default')}`);

      if (settings.env?.API_TIMEOUT_MS) {
        console.log(`  API Timeout: ${chalk.gray(settings.env.API_TIMEOUT_MS + 'ms')}`);
      }

      if (settings.env?.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC) {
        console.log(`  Disable Non-Essential Traffic: ${chalk.gray(settings.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC)}`);
      }

      if (currentProfile?.description) {
        console.log(`  Description: ${chalk.gray(currentProfile.description)}`);
      }
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

program
  .command('add')
  .description('Add a new provider profile')
  .action(async () => {
    try {
      console.log(chalk.bold('\n📝 Add a new provider profile\n'));

      const { preset } = await prompts({
        type: 'select',
        name: 'preset',
        message: 'Select provider type:',
        choices: PROVIDER_PRESETS.map(p => ({
          title: `${p.icon} ${p.name}`,
          description: p.description,
          value: p.id
        }))
      });

      if (!preset) return;

      const selectedPreset = PROVIDER_PRESETS.find(p => p.id === preset)!;

      // Ask for token
      const { token } = await prompts({
        type: 'password',
        name: 'token',
        message: 'Enter API token:',
        validate: (val: string) => val.trim().length > 0 || 'Token is required'
      });

      if (!token) return;

      // Custom profile requires base URL
      let customBaseUrl = selectedPreset.baseUrl;
      if (preset === 'custom') {
        const { baseUrl } = await prompts({
          type: 'text',
          name: 'baseUrl',
          message: 'Enter base API URL:',
          validate: (val: string) => val.trim().length > 0 || 'Base URL is required'
        });
        if (!baseUrl) return;
        customBaseUrl = baseUrl;
      }

      // Ask for custom name and description
      const { useCustomName } = await prompts({
        type: 'confirm',
        name: 'useCustomName',
        message: 'Use custom profile name?',
        initial: false
      });

      let customName = '';
      let customDescription = '';
      if (useCustomName) {
        const nameDesc = await prompts([
          {
            type: 'text',
            name: 'name',
            message: 'Enter profile name:',
            validate: (val: string) => val.trim().length > 0 || 'Name is required'
          },
          {
            type: 'text',
            name: 'description',
            message: 'Enter description (optional):'
          }
        ]);
        if (!nameDesc.name) return;
        customName = nameDesc.name;
        customDescription = nameDesc.description;
      }

      // Check for existing profile
      const profileId = sanitizeId(customName || selectedPreset.id);
      if (await profileExists(profileId)) {
        const { overwrite } = await prompts({
          type: 'confirm',
          name: 'overwrite',
          message: `Profile "${profileId}" already exists. Overwrite?`,
          initial: false
        });
        if (!overwrite) {
          console.log(chalk.yellow('Cancelled'));
          return;
        }
      }

      // Optional: Custom models
      const { customizeModels } = await prompts({
        type: 'confirm',
        name: 'customizeModels',
        message: 'Customize model names?',
        initial: false
      });

      let customHaiku: string | undefined;
      let customSonnet: string | undefined;
      let customOpus: string | undefined;

      if (customizeModels) {
        const models = await prompts([
          {
            type: 'text',
            name: 'haiku',
            message: 'Haiku model name:',
            initial: selectedPreset.defaultModels?.haiku
          },
          {
            type: 'text',
            name: 'sonnet',
            message: 'Sonnet model name:',
            initial: selectedPreset.defaultModels?.sonnet
          },
          {
            type: 'text',
            name: 'opus',
            message: 'Opus model name:',
            initial: selectedPreset.defaultModels?.opus
          }
        ]);
        customHaiku = models.haiku;
        customSonnet = models.sonnet;
        customOpus = models.opus;
      }

      // Optional: Icon
      const { icon } = await prompts({
        type: 'text',
        name: 'icon',
        message: 'Icon (emoji):',
        initial: selectedPreset.icon || '📦'
      });

      // Optional: Advanced settings
      const { advancedSettings } = await prompts({
        type: 'confirm',
        name: 'advancedSettings',
        message: 'Configure advanced settings?',
        initial: false
      });

      let customApiTimeout: string | undefined;
      let disableNonEssentialTraffic: string | undefined;

      if (advancedSettings) {
        const advanced = await prompts([
          {
            type: 'text',
            name: 'apiTimeout',
            message: 'API timeout (ms, leave empty for default):'
          },
          {
            type: 'confirm',
            name: 'disableTraffic',
            message: 'Disable non-essential traffic?',
            initial: false
          }
        ]);
        if (advanced.apiTimeout) customApiTimeout = advanced.apiTimeout;
        if (advanced.disableTraffic) disableNonEssentialTraffic = 'true';
      }

      // Create profile
      const profile = createProfileFromPreset(selectedPreset, token, {
        customName: customName || undefined,
        customDescription: customDescription || undefined,
        customBaseUrl,
        customHaiku,
        customSonnet,
        customOpus,
        customIcon: icon,
        customApiTimeout,
        disableNonEssentialTraffic
      });

      // Save profile
      await saveProfile(profile);

      console.log(chalk.green(`\n✓ Profile "${profile.name}" (${profile.id}) created successfully!`));
      console.log(chalk.gray(`  Run: cc-switch use ${profile.id}`));

    } catch (err: any) {
      if (err.message === 'User cancelled') {
        console.log(chalk.yellow('\nCancelled'));
        return;
      }
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('delete')
  .alias('rm')
  .description('Delete a provider profile')
  .action(async () => {
    try {
      const profiles = await listProfiles();
      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles found.'));
        return;
      }

      const { profileId } = await prompts({
        type: 'select',
        name: 'profileId',
        message: 'Select profile to delete:',
        choices: profiles.map(p => ({
          title: `${p.icon} ${p.name}`,
          description: `${p.id}${p.description ? ' - ' + p.description : ''}`,
          value: p.id
        }))
      });

      if (!profileId) {
        console.log(chalk.yellow('Cancelled'));
        return;
      }

      const profile = profiles.find(p => p.id === profileId)!;

      // Confirm deletion
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Delete profile "${profile.icon} ${profile.name}" (${profile.id})?`,
        initial: false
      });

      if (!confirm) {
        console.log(chalk.yellow('Cancelled'));
        return;
      }

      await deleteProfile(profileId);
      console.log(chalk.green(`✓ Deleted profile "${profile.name}" (${profileId})`));
    } catch (err: any) {
      if (err.message === 'User cancelled') {
        console.log(chalk.yellow('Cancelled'));
        return;
      }
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('edit')
  .alias('modify')
  .description('Edit an existing provider profile')
  .action(async () => {
    try {
      const profiles = await listProfiles();
      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles found.'));
        return;
      }

      const { profileId } = await prompts({
        type: 'select',
        name: 'profileId',
        message: 'Select profile to edit:',
        choices: profiles.map(p => ({
          title: `${p.icon} ${p.name}`,
          description: `${p.id}${p.description ? ' - ' + p.description : ''}`,
          value: p.id
        }))
      });

      if (!profileId) {
        console.log(chalk.yellow('Cancelled'));
        return;
      }

      const profile = await loadProfile(profileId);
      const currentEnv = profile.config.env;

      console.log(chalk.bold(`\nEditing: ${profile.icon} ${profile.name} (${profile.id})\n`));

      // Prompt for editable fields with current values as defaults
      const answers = await prompts([
        {
          type: 'text',
          name: 'name',
          message: 'Profile name:',
          initial: profile.name
        },
        {
          type: 'text',
          name: 'description',
          message: 'Description:',
          initial: profile.description || ''
        },
        {
          type: 'password',
          name: 'token',
          message: 'API token (leave empty to keep current):',
          initial: ''
        },
        {
          type: 'text',
          name: 'baseUrl',
          message: 'Base URL (leave empty to keep current):',
          initial: currentEnv.ANTHROPIC_BASE_URL || ''
        },
        {
          type: 'text',
          name: 'haikuModel',
          message: 'Haiku model (leave empty to keep current):',
          initial: currentEnv.ANTHROPIC_DEFAULT_HAIKU_MODEL || ''
        },
        {
          type: 'text',
          name: 'sonnetModel',
          message: 'Sonnet model (leave empty to keep current):',
          initial: currentEnv.ANTHROPIC_DEFAULT_SONNET_MODEL || ''
        },
        {
          type: 'text',
          name: 'opusModel',
          message: 'Opus model (leave empty to keep current):',
          initial: currentEnv.ANTHROPIC_DEFAULT_OPUS_MODEL || ''
        }
      ]);

      // Build updated profile
      const updatedProfile: typeof profile = {
        ...profile,
        name: answers.name || profile.name,
        description: answers.description || profile.description,
        config: {
          env: {
            ANTHROPIC_AUTH_TOKEN: answers.token || currentEnv.ANTHROPIC_AUTH_TOKEN
          }
        }
      };

      // Add optional fields only if provided
      if (answers.baseUrl) {
        updatedProfile.config.env.ANTHROPIC_BASE_URL = answers.baseUrl;
      } else if (currentEnv.ANTHROPIC_BASE_URL) {
        updatedProfile.config.env.ANTHROPIC_BASE_URL = currentEnv.ANTHROPIC_BASE_URL;
      }

      if (answers.haikuModel) {
        updatedProfile.config.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = answers.haikuModel;
      } else if (currentEnv.ANTHROPIC_DEFAULT_HAIKU_MODEL) {
        updatedProfile.config.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = currentEnv.ANTHROPIC_DEFAULT_HAIKU_MODEL;
      }

      if (answers.sonnetModel) {
        updatedProfile.config.env.ANTHROPIC_DEFAULT_SONNET_MODEL = answers.sonnetModel;
      } else if (currentEnv.ANTHROPIC_DEFAULT_SONNET_MODEL) {
        updatedProfile.config.env.ANTHROPIC_DEFAULT_SONNET_MODEL = currentEnv.ANTHROPIC_DEFAULT_SONNET_MODEL;
      }

      if (answers.opusModel) {
        updatedProfile.config.env.ANTHROPIC_DEFAULT_OPUS_MODEL = answers.opusModel;
      } else if (currentEnv.ANTHROPIC_DEFAULT_OPUS_MODEL) {
        updatedProfile.config.env.ANTHROPIC_DEFAULT_OPUS_MODEL = currentEnv.ANTHROPIC_DEFAULT_OPUS_MODEL;
      }

      await updateProfile(updatedProfile);
      console.log(chalk.green(`\n✓ Profile "${updatedProfile.name}" updated successfully!`));
    } catch (err: any) {
      if (err.message === 'User cancelled') {
        console.log(chalk.yellow('\nCancelled'));
        return;
      }
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse();
