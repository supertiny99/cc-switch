import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { ProviderProfile } from './schema';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PROFILES_DIR = path.join(CLAUDE_DIR, 'profiles');

export interface ProviderPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseUrl?: string;
  defaultModels?: {
    haiku?: string;
    sonnet?: string;
    opus?: string;
  };
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'anthropic',
    name: 'Anthropic (Official)',
    description: 'Official Anthropic API',
    icon: '🔷',
    defaultModels: {
      haiku: 'claude-3-5-haiku-20241022',
      sonnet: 'claude-3-5-sonnet-20241022',
      opus: 'claude-3-5-opus-20241022'
    }
  },
  {
    id: 'zhipu-coding',
    name: 'Zhipu GLM Coding Plan',
    description: 'GLM Coding Plan (编程套餐)',
    icon: '💻',
    baseUrl: 'https://open.bigmodel.cn/api/anthropic',
    defaultModels: {
      haiku: 'glm-4.5-air',
      sonnet: 'glm-4.7',
      opus: 'glm-4.7'
    }
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'OpenRouter AI (200+ models)',
    icon: '🔀',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModels: {
      haiku: 'anthropic/claude-3.5-haiku',
      sonnet: 'anthropic/claude-3.5-sonnet',
      opus: 'anthropic/claude-3.5-opus'
    }
  },
  {
    id: 'cloudflare-worker',
    name: 'Cloudflare Worker Proxy',
    description: 'Cloudflare Worker Claude Proxy',
    icon: '☁️',
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    description: 'Custom API endpoint',
    icon: '🔌',
  }
];

export async function saveProfile(profile: ProviderProfile): Promise<void> {
  await fs.ensureDir(PROFILES_DIR);
  const profilePath = path.join(PROFILES_DIR, `${profile.id}.json`);
  if (await fs.pathExists(profilePath)) {
    throw new Error(`Profile ${profile.id} already exists`);
  }
  await fs.writeJSON(profilePath, profile, { spaces: 2 });
}

export function sanitizeId(input: string): string {
  return input.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function createProfileFromPreset(
  preset: ProviderPreset,
  token: string,
  options: {
    customName?: string;
    customDescription?: string;
    customBaseUrl?: string;
    customHaiku?: string;
    customSonnet?: string;
    customOpus?: string;
    customIcon?: string;
    customApiTimeout?: string;
    disableNonEssentialTraffic?: string;
  } = {}
): ProviderProfile {
  const name = options.customName || preset.name;
  const id = sanitizeId(options.customName || preset.id);
  const description = options.customDescription || preset.description;
  const baseUrl = options.customBaseUrl || preset.baseUrl;
  const icon = options.customIcon || preset.icon;

  const profile: ProviderProfile = {
    id,
    name,
    description,
    icon,
    config: {
      env: {
        ANTHROPIC_AUTH_TOKEN: token,
      }
    }
  };

  if (baseUrl) {
    profile.config.env.ANTHROPIC_BASE_URL = baseUrl;
  }

  const haikuModel = options.customHaiku || preset.defaultModels?.haiku;
  if (haikuModel) {
    profile.config.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = haikuModel;
  }

  const sonnetModel = options.customSonnet || preset.defaultModels?.sonnet;
  if (sonnetModel) {
    profile.config.env.ANTHROPIC_DEFAULT_SONNET_MODEL = sonnetModel;
  }

  const opusModel = options.customOpus || preset.defaultModels?.opus;
  if (opusModel) {
    profile.config.env.ANTHROPIC_DEFAULT_OPUS_MODEL = opusModel;
  }

  if (options.customApiTimeout) {
    profile.config.env.API_TIMEOUT_MS = options.customApiTimeout;
  }

  if (options.disableNonEssentialTraffic) {
    profile.config.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = options.disableNonEssentialTraffic;
  }

  return profile;
}

export async function profileExists(id: string): Promise<boolean> {
  const profilePath = path.join(PROFILES_DIR, `${id}.json`);
  return fs.pathExists(profilePath);
}
