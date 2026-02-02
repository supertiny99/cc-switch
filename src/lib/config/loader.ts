import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { Settings, ProviderProfile } from './schema';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');
const PROFILES_DIR = path.join(CLAUDE_DIR, 'profiles');

export async function loadSettings(): Promise<Settings> {
  if (!(await fs.pathExists(SETTINGS_FILE))) {
    throw new Error('Claude Code settings not found');
  }
  return fs.readJSON(SETTINGS_FILE);
}

export async function loadProfile(profileId: string): Promise<ProviderProfile> {
  const profilePath = path.join(PROFILES_DIR, `${profileId}.json`);
  if (!(await fs.pathExists(profilePath))) {
    throw new Error(`Profile not found: ${profileId}`);
  }
  return fs.readJSON(profilePath);
}

export async function listProfiles(): Promise<ProviderProfile[]> {
  if (!(await fs.pathExists(PROFILES_DIR))) {
    await fs.ensureDir(PROFILES_DIR);
    return [];
  }
  const files = await fs.readdir(PROFILES_DIR);
  const profiles: ProviderProfile[] = [];
  for (const file of files) {
    if (file.endsWith('.json')) {
      const profile = await fs.readJSON(path.join(PROFILES_DIR, file));
      profiles.push(profile);
    }
  }
  return profiles;
}

export function getCurrentProvider(settings: Settings): string | null {
  const baseUrl = settings.env?.ANTHROPIC_BASE_URL;
  if (!baseUrl) return 'anthropic';
  if (baseUrl.includes('open.bigmodel.cn/api/anthropic')) return 'zhipu-coding';
  if (baseUrl.includes('bigmodel.cn')) return 'zhipu-coding';
  if (baseUrl.includes('openrouter.ai')) return 'openrouter';
  if (baseUrl.includes('api.anthropic.com')) return 'anthropic';
  if (baseUrl.includes('workers.dev')) return 'cloudflare-worker';
  return 'custom';
}

export function getCurrentProfileId(settings: Settings): string | null {
  return (settings as any)['cc-switch-current-profile'] || null;
}
