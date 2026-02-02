import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import {
  backupSettings,
  applyProfile,
  listBackups,
  restoreBackup,
  deleteProfile,
  updateProfile,
} from './writer';
import type { Settings, ProviderProfile } from './schema';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readJSON: vi.fn(),
    writeJSON: vi.fn(),
    readdir: vi.fn(),
    ensureDir: vi.fn(),
    copy: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockFs = fs as any;

describe('config/writer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('backupSettings', () => {
    it('should create backup directory and copy settings file', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);

      const backupPath = await backupSettings();

      expect(mockFs.ensureDir).toHaveBeenCalledWith(
        path.join(os.homedir(), '.claude', 'cc-switch-backups')
      );
      expect(mockFs.copy).toHaveBeenCalled();
      expect(backupPath).toMatch(/cc-switch-backups\/settings-\d{4}-\d{2}-\d{2}T.*\.json$/);
    });

    it('should generate unique timestamped backup filenames', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);

      const backupPath1 = await backupSettings();
      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));
      const backupPath2 = await backupSettings();

      expect(backupPath1).not.toBe(backupPath2);
    });
  });

  describe('applyProfile', () => {
    const mockProfile: ProviderProfile = {
      id: 'test-profile',
      name: 'Test Profile',
      icon: '🧪',
      config: {
        env: {
          ANTHROPIC_AUTH_TOKEN: 'new-token',
          ANTHROPIC_BASE_URL: 'https://api.new.com',
          ANTHROPIC_DEFAULT_HAIKU_MODEL: 'haiku-1',
          ANTHROPIC_DEFAULT_SONNET_MODEL: 'sonnet-1',
          ANTHROPIC_DEFAULT_OPUS_MODEL: 'opus-1',
        },
      },
    };

    const mockSettings: Settings = {
      env: {
        ANTHROPIC_AUTH_TOKEN: 'old-token',
        ANTHROPIC_BASE_URL: 'https://api.old.com',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'old-haiku',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'old-sonnet',
        API_TIMEOUT_MS: '30000',
        SOME_OTHER_VAR: 'keep-me',
      },
    };

    it('should create backup before applying profile', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);
      mockFs.readJSON.mockResolvedValue(mockSettings);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await applyProfile(mockProfile);

      expect(mockFs.copy).toHaveBeenCalled();
    });

    it('should clear old profile env vars not in new profile', async () => {
      const profileWithFewerVars: ProviderProfile = {
        id: 'minimal-profile',
        name: 'Minimal Profile',
        config: {
          env: {
            ANTHROPIC_AUTH_TOKEN: 'new-token',
            // Note: ANTHROPIC_BASE_URL and models are not set
          },
        },
      };

      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);
      mockFs.readJSON.mockResolvedValue(mockSettings);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await applyProfile(profileWithFewerVars);

      const writtenSettings = mockFs.writeJSON.mock.calls[0][1];
      // Old values should be cleared
      expect(writtenSettings.env.ANTHROPIC_BASE_URL).toBeUndefined();
      expect(writtenSettings.env.API_TIMEOUT_MS).toBeUndefined();
      expect(writtenSettings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBeUndefined();
      // New value should be set
      expect(writtenSettings.env.ANTHROPIC_AUTH_TOKEN).toBe('new-token');
    });

    it('should apply new profile env vars', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);
      mockFs.readJSON.mockResolvedValue(mockSettings);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await applyProfile(mockProfile);

      const writtenSettings = mockFs.writeJSON.mock.calls[0][1];
      expect(writtenSettings.env.ANTHROPIC_AUTH_TOKEN).toBe('new-token');
      expect(writtenSettings.env.ANTHROPIC_BASE_URL).toBe('https://api.new.com');
      expect(writtenSettings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe('haiku-1');
      expect(writtenSettings.env.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe('sonnet-1');
      expect(writtenSettings.env.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe('opus-1');
    });

    it('should preserve non-profile env vars', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);
      mockFs.readJSON.mockResolvedValue(mockSettings);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await applyProfile(mockProfile);

      const writtenSettings = mockFs.writeJSON.mock.calls[0][1];
      expect(writtenSettings.env.SOME_OTHER_VAR).toBe('keep-me');
    });

    it('should store current profile ID', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);
      mockFs.readJSON.mockResolvedValue(mockSettings);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await applyProfile(mockProfile);

      const writtenSettings = mockFs.writeJSON.mock.calls[0][1];
      expect(writtenSettings['cc-switch-current-profile']).toBe('test-profile');
    });

    it('should handle settings without env object', async () => {
      const emptySettings: Settings = {};
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);
      mockFs.readJSON.mockResolvedValue(emptySettings);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await applyProfile(mockProfile);

      const writtenSettings = mockFs.writeJSON.mock.calls[0][1];
      expect(writtenSettings.env).toBeDefined();
      expect(writtenSettings.env.ANTHROPIC_AUTH_TOKEN).toBe('new-token');
    });

    it('should write formatted JSON with spaces', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.copy.mockResolvedValue(undefined);
      mockFs.readJSON.mockResolvedValue(mockSettings);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await applyProfile(mockProfile);

      const writeOptions = mockFs.writeJSON.mock.calls[0][2];
      expect(writeOptions).toEqual({ spaces: 2 });
    });
  });

  describe('listBackups', () => {
    it('should return empty array when backup directory does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      const result = await listBackups();
      expect(result).toEqual([]);
    });

    it('should return list of backup files sorted in reverse order', async () => {
      const mockFiles = [
        'settings-2024-01-01T10-00-00-000Z.json',
        'settings-2024-01-02T10-00-00-000Z.json',
        'settings-2024-01-03T10-00-00-000Z.json',
      ];
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readdir.mockResolvedValue(mockFiles);

      const result = await listBackups();
      expect(result).toEqual([
        'settings-2024-01-03T10-00-00-000Z.json',
        'settings-2024-01-02T10-00-00-000Z.json',
        'settings-2024-01-01T10-00-00-000Z.json',
      ]);
    });

    it('should filter out non-JSON files', async () => {
      const mockFiles = [
        'settings-2024-01-01T10-00-00-000Z.json',
        'readme.md',
        '.DS_Store',
      ];
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readdir.mockResolvedValue(mockFiles);

      const result = await listBackups();
      expect(result).toEqual(['settings-2024-01-01T10-00-00-000Z.json']);
    });
  });

  describe('restoreBackup', () => {
    it('should throw error when backup does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(restoreBackup('nonexistent.json')).rejects.toThrow(
        'Backup not found: nonexistent.json'
      );
    });

    it('should copy backup to settings file', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.copy.mockResolvedValue(undefined);

      await restoreBackup('settings-backup.json');

      expect(mockFs.copy).toHaveBeenCalledWith(
        path.join(os.homedir(), '.claude', 'cc-switch-backups', 'settings-backup.json'),
        path.join(os.homedir(), '.claude', 'settings.json')
      );
    });
  });

  describe('deleteProfile', () => {
    it('should throw error when profile does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(deleteProfile('nonexistent')).rejects.toThrow('Profile not found: nonexistent');
    });

    it('should remove profile file', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.remove.mockResolvedValue(undefined);

      await deleteProfile('test-profile');

      expect(mockFs.remove).toHaveBeenCalledWith(
        path.join(os.homedir(), '.claude', 'profiles', 'test-profile.json')
      );
    });
  });

  describe('updateProfile', () => {
    const mockProfile: ProviderProfile = {
      id: 'test-profile',
      name: 'Updated Profile',
      icon: '✨',
      config: {
        env: {
          ANTHROPIC_AUTH_TOKEN: 'updated-token',
          ANTHROPIC_BASE_URL: 'https://api.updated.com',
        },
      },
    };

    it('should throw error when profile does not exist', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.pathExists.mockResolvedValue(false);

      await expect(updateProfile(mockProfile)).rejects.toThrow('Profile not found: test-profile');
    });

    it('should write updated profile with proper formatting', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await updateProfile(mockProfile);

      expect(mockFs.writeJSON).toHaveBeenCalledWith(
        path.join(os.homedir(), '.claude', 'profiles', 'test-profile.json'),
        mockProfile,
        { spaces: 2 }
      );
    });

    it('should ensure profiles directory exists', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.writeJSON.mockResolvedValue(undefined);

      await updateProfile(mockProfile);

      expect(mockFs.ensureDir).toHaveBeenCalledWith(
        path.join(os.homedir(), '.claude', 'profiles')
      );
    });
  });
});
