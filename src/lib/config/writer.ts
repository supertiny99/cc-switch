import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { Settings, ProviderProfile } from './schema';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');
const BACKUP_DIR = path.join(CLAUDE_DIR, 'cc-switch-backups');
const PROFILES_DIR = path.join(CLAUDE_DIR, 'profiles');
const PROFILE_ENV_KEYS = [
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
  'API_TIMEOUT_MS',
  'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC',
];

export async function backupSettings(): Promise<string> {
  await fs.ensureDir(BACKUP_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `settings-${timestamp}.json`);
  await fs.copy(SETTINGS_FILE, backupPath);
  return backupPath;
}

export async function applyProfile(profile: ProviderProfile): Promise<void> {
  await backupSettings();

  const settings: Settings = await fs.readJSON(SETTINGS_FILE);

  // Clear all profile-related env vars first (complete replacement)
  if (settings.env) {
    for (const key of PROFILE_ENV_KEYS) {
      delete settings.env[key];
    }
  } else {
    settings.env = {};
  }

  // Set new profile env vars
  for (const [key, value] of Object.entries(profile.config.env)) {
    if (value !== undefined) {
      settings.env[key] = value;
    }
  }

  // Store current profile ID
  settings['cc-switch-current-profile'] = profile.id;

  await fs.writeJSON(SETTINGS_FILE, settings, { spaces: 2 });
}

export async function listBackups(): Promise<string[]> {
  if (!(await fs.pathExists(BACKUP_DIR))) return [];
  const files = await fs.readdir(BACKUP_DIR);
  return files.filter((f: string) => f.endsWith('.json')).sort().reverse();
}

export async function restoreBackup(backupFile: string): Promise<void> {
  const backupPath = path.join(BACKUP_DIR, backupFile);
  if (!(await fs.pathExists(backupPath))) {
    throw new Error(`Backup not found: ${backupFile}`);
  }
  await fs.copy(backupPath, SETTINGS_FILE);
}

export async function deleteProfile(profileId: string): Promise<void> {
  const profilePath = path.join(PROFILES_DIR, `${profileId}.json`);
  if (!(await fs.pathExists(profilePath))) {
    throw new Error(`Profile not found: ${profileId}`);
  }
  await fs.remove(profilePath);
}

export async function updateProfile(profile: ProviderProfile): Promise<void> {
  await fs.ensureDir(PROFILES_DIR);
  const profilePath = path.join(PROFILES_DIR, `${profile.id}.json`);
  if (!(await fs.pathExists(profilePath))) {
    throw new Error(`Profile not found: ${profile.id}`);
  }
  await fs.writeJSON(profilePath, profile, { spaces: 2 });
}
