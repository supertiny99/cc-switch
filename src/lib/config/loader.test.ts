import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import {
  loadSettings,
  loadProfile,
  listProfiles,
  getCurrentProvider,
  getCurrentProfileId,
} from './loader';
import type { Settings, ProviderProfile } from './schema';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readJSON: vi.fn(),
    readdir: vi.fn(),
    ensureDir: vi.fn(),
  },
}));

const mockFs = fs as any;

describe('config/loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadSettings', () => {
    it('should throw error when settings file does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(loadSettings()).rejects.toThrow('Claude Code settings not found');
    });

    it('should return settings when file exists', async () => {
      const mockSettings: Settings = {
        env: {
          ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
        },
      };
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJSON.mockResolvedValue(mockSettings);

      const result = await loadSettings();
      expect(result).toEqual(mockSettings);
      expect(mockFs.readJSON).toHaveBeenCalledWith(
        path.join(os.homedir(), '.claude', 'settings.json')
      );
    });

    it('should handle malformed JSON', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJSON.mockRejectedValue(new SyntaxError('Unexpected token'));

      await expect(loadSettings()).rejects.toThrow(SyntaxError);
    });
  });

  describe('loadProfile', () => {
    const mockProfile: ProviderProfile = {
      id: 'test-profile',
      name: 'Test Profile',
      description: 'A test profile',
      icon: '🧪',
      config: {
        env: {
          ANTHROPIC_AUTH_TOKEN: 'test-token',
          ANTHROPIC_BASE_URL: 'https://api.test.com',
        },
      },
    };

    it('should throw error when profile does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(loadProfile('nonexistent')).rejects.toThrow('Profile not found: nonexistent');
    });

    it('should return profile when it exists', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJSON.mockResolvedValue(mockProfile);

      const result = await loadProfile('test-profile');
      expect(result).toEqual(mockProfile);
      expect(mockFs.readJSON).toHaveBeenCalledWith(
        path.join(os.homedir(), '.claude', 'profiles', 'test-profile.json')
      );
    });

    it('should handle malformed profile JSON', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJSON.mockRejectedValue(new SyntaxError('Unexpected token'));

      await expect(loadProfile('test-profile')).rejects.toThrow(SyntaxError);
    });
  });

  describe('listProfiles', () => {
    it('should create profiles directory and return empty array when it does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.ensureDir.mockResolvedValue(undefined);

      const result = await listProfiles();
      expect(result).toEqual([]);
      expect(mockFs.ensureDir).toHaveBeenCalledWith(
        path.join(os.homedir(), '.claude', 'profiles')
      );
    });

    it('should return list of profiles', async () => {
      const mockFiles = ['profile1.json', 'profile2.json', 'readme.md'];
      const mockProfiles: ProviderProfile[] = [
        {
          id: 'profile1',
          name: 'Profile 1',
          config: { env: { ANTHROPIC_AUTH_TOKEN: 'token1' } },
        },
        {
          id: 'profile2',
          name: 'Profile 2',
          config: { env: { ANTHROPIC_AUTH_TOKEN: 'token2' } },
        },
      ];

      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readdir.mockResolvedValue(mockFiles);
      mockFs.readJSON
        .mockResolvedValueOnce(mockProfiles[0])
        .mockResolvedValueOnce(mockProfiles[1]);

      const result = await listProfiles();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockProfiles[0]);
      expect(result[1]).toEqual(mockProfiles[1]);
    });

    it('should filter out non-JSON files', async () => {
      const mockFiles = ['profile1.json', 'readme.md', '.DS_Store'];

      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readdir.mockResolvedValue(mockFiles);
      mockFs.readJSON.mockResolvedValue({
        id: 'profile1',
        name: 'Profile 1',
        config: { env: { ANTHROPIC_AUTH_TOKEN: 'token1' } },
      });

      const result = await listProfiles();
      expect(result).toHaveLength(1);
      expect(mockFs.readJSON).toHaveBeenCalledTimes(1);
    });

    it('should handle empty profiles directory', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readdir.mockResolvedValue([]);

      const result = await listProfiles();
      expect(result).toEqual([]);
    });
  });

  describe('getCurrentProvider', () => {
    it('should return "anthropic" when no BASE_URL is set', () => {
      const settings: Settings = {};
      expect(getCurrentProvider(settings)).toBe('anthropic');
    });

    it('should return "anthropic" for api.anthropic.com', () => {
      const settings: Settings = {
        env: { ANTHROPIC_BASE_URL: 'https://api.anthropic.com' },
      };
      expect(getCurrentProvider(settings)).toBe('anthropic');
    });

    it('should return "zhipu-coding" for bigmodel.cn', () => {
      const settings: Settings = {
        env: { ANTHROPIC_BASE_URL: 'https://open.bigmodel.cn/api/anthropic' },
      };
      expect(getCurrentProvider(settings)).toBe('zhipu-coding');
    });

    it('should return "zhipu-coding" for bigmodel.cn (alternative path)', () => {
      const settings: Settings = {
        env: { ANTHROPIC_BASE_URL: 'https://bigmodel.cn/v1' },
      };
      expect(getCurrentProvider(settings)).toBe('zhipu-coding');
    });

    it('should return "openrouter" for openrouter.ai', () => {
      const settings: Settings = {
        env: { ANTHROPIC_BASE_URL: 'https://openrouter.ai/api/v1' },
      };
      expect(getCurrentProvider(settings)).toBe('openrouter');
    });

    it('should return "cloudflare-worker" for workers.dev', () => {
      const settings: Settings = {
        env: { ANTHROPIC_BASE_URL: 'https://my-worker.workers.dev' },
      };
      expect(getCurrentProvider(settings)).toBe('cloudflare-worker');
    });

    it('should return "custom" for unknown URLs', () => {
      const settings: Settings = {
        env: { ANTHROPIC_BASE_URL: 'https://api.unknown-provider.com' },
      };
      expect(getCurrentProvider(settings)).toBe('custom');
    });

    it('should handle settings without env object', () => {
      const settings: Settings = {};
      expect(getCurrentProvider(settings)).toBe('anthropic');
    });
  });

  describe('getCurrentProfileId', () => {
    it('should return null when no current profile is set', () => {
      const settings: Settings = {};
      expect(getCurrentProfileId(settings)).toBeNull();
    });

    it('should return the current profile ID', () => {
      const settings: Settings = {
        'cc-switch-current-profile': 'my-profile',
      } as any;
      expect(getCurrentProfileId(settings)).toBe('my-profile');
    });

    it('should return null for undefined value', () => {
      const settings: Settings = {
        'cc-switch-current-profile': undefined,
      } as any;
      expect(getCurrentProfileId(settings)).toBeNull();
    });
  });
});
