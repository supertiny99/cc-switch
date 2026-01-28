import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { Settings, ProviderProfile } from './schema';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');
const BACKUP_DIR = path.join(CLAUDE_DIR, 'cc-switch-backups');

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
  const newEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(profile.config.env)) {
    if (value !== undefined) {
      newEnv[key] = value;
    }
  }
  settings.env = { ...settings.env, ...newEnv };

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
