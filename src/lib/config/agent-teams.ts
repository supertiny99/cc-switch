import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { Settings } from './schema';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');

const AGENT_TEAMS_ENV_KEY = 'CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS';
const DEFAULT_TEAMMATE_MODE = 'tmux';

export interface AgentTeamsStatus {
  enabled: boolean;
  teammateMode: string | null;
}

export async function getAgentTeamsStatus(): Promise<AgentTeamsStatus> {
  if (!(await fs.pathExists(SETTINGS_FILE))) {
    return { enabled: false, teammateMode: null };
  }
  const settings: Settings = await fs.readJSON(SETTINGS_FILE);
  const enabled = settings.env?.[AGENT_TEAMS_ENV_KEY] === '1';
  const teammateMode = settings.teammateMode || null;
  return { enabled, teammateMode };
}

export async function enableAgentTeams(): Promise<void> {
  const settings: Settings = await fs.readJSON(SETTINGS_FILE);
  
  if (!settings.env) {
    settings.env = {};
  }
  settings.env[AGENT_TEAMS_ENV_KEY] = '1';
  
  if (!settings.teammateMode) {
    settings.teammateMode = DEFAULT_TEAMMATE_MODE;
  }
  
  await fs.writeJSON(SETTINGS_FILE, settings, { spaces: 2 });
}

export async function disableAgentTeams(): Promise<void> {
  const settings: Settings = await fs.readJSON(SETTINGS_FILE);
  
  if (settings.env) {
    delete settings.env[AGENT_TEAMS_ENV_KEY];
  }
  
  await fs.writeJSON(SETTINGS_FILE, settings, { spaces: 2 });
}

export async function setTeammateMode(value: string): Promise<void> {
  const settings: Settings = await fs.readJSON(SETTINGS_FILE);
  settings.teammateMode = value;
  await fs.writeJSON(SETTINGS_FILE, settings, { spaces: 2 });
}
