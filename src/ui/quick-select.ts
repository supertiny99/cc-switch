import prompts from 'prompts';
import chalk from 'chalk';
import { loadProfile, listProfiles } from '../lib/config/loader';
import { applyProfile } from '../lib/config/writer';
import { loadSettings, getCurrentProvider } from '../lib/config/loader';

export async function quickSelect(): Promise<void> {
  const profiles = await listProfiles();
  const settings = await loadSettings();
  const current = getCurrentProvider(settings);

  if (profiles.length === 0) {
    console.log(chalk.yellow('No profiles found. Create profiles in ~/.claude/profiles/'));
    return;
  }

  const { profileId } = await prompts({
    type: 'autocomplete',
    name: 'profileId',
    message: 'Select provider (type to filter):',
    choices: profiles.map(p => ({
      title: `${p.icon || '📦'} ${p.name}`,
      description: p.description,
      value: p.id,
      selected: p.id === current
    })),
    suggest: (input, choices) => {
      return Promise.resolve(choices.filter((choice: any) =>
        choice.title.toLowerCase().includes(input.toLowerCase())
      ));
    }
  });

  if (profileId) {
    const profile = await loadProfile(profileId);
    await applyProfile(profile);
    console.log(chalk.green(`✓ Switched to ${profile.name}`));
  }
}
