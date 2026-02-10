# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`cc-switch` is a CLI tool for quickly switching Claude Code API providers. When an API token quota is exhausted, users can switch to another provider/token in 1-2 seconds using an interactive TUI.

## Development Commands

```bash
# Development mode (run TypeScript directly)
npm run dev -- [command]           # e.g., npm run dev -- list

# Build TypeScript to JavaScript
npm run build

# Link for local testing (installs as global command)
npm run link:global                 # Build + link in one command

# Unlink after testing
npm unlink -g cc-switch

# Testing (vitest)
npm test                            # Run tests in watch mode
npm run test:run                    # Run tests once
npm run test:coverage               # Run tests with coverage

# Publish to npm (automated via GitHub Actions)
npm version patch|minor|major       # Bump version and push
npm run release:patch               # Quick patch release
npm run release:minor               # Quick minor release
npm run release:major               # Quick major release
```

## Architecture

The codebase follows a modular CLI architecture:

### Core Structure

```
src/
├── index.ts              # CLI entry point (Commander.js commands)
├── lib/config/
│   ├── schema.ts         # TypeScript interfaces (ProviderProfile, Settings)
│   ├── loader.ts         # Config loading functions
│   ├── writer.ts         # Config writing + backup/restore
│   ├── creator.ts        # Provider profile creation and presets
│   └── saver.ts          # Save current config as profile (v1.1.0+)
└── ui/
    └── quick-select.ts   # Interactive TUI (prompts library)
```

### Key Modules

**CLI Commands (src/index.ts)**: Defines all CLI commands using Commander.js:
- `cc-switch` - Interactive provider selection
- `cc-switch add` - Add a new provider profile with interactive setup
- `cc-switch save` - Save current config as a new profile (v1.1.0+)
- `cc-switch delete` / `cc-switch rm` - Delete a provider profile
- `cc-switch edit` / `cc-switch modify` - Edit an existing provider profile
- `cc-switch use <id>` - Direct switch to profile (with auto-save prompt for unknown configs, v1.1.0+)
- `cc-switch list` - List available profiles
- `cc-switch current` - Show current config
- `cc-switch history` - Show backup history
- `cc-switch restore <file>` - Restore from backup

**Config Loader (src/lib/config/loader.ts)**: Functions for reading configurations:
- `loadSettings()` - Reads `~/.claude/settings.json`
- `loadProfile(id)` - Reads `~/.claude/profiles/{id}.json`
- `listProfiles()` - Lists all available profiles
- `getCurrentProvider(settings)` - Detects current provider from BASE_URL
- `getCurrentProfileId(settings)` - Gets current profile ID from settings

**Config Creator (src/lib/config/creator.ts)**: Provider profile creation:
- `PROVIDER_PRESETS` - Array of 5 provider presets (Anthropic, Zhipu GLM Coding, OpenRouter, Cloudflare Worker, Custom)
- `createProfileFromPreset()` - Creates a profile from a preset with customizations
- `saveProfile()` - Saves profile to disk
- `sanitizeId()` - Sanitizes profile ID for safe filenames
- `profileExists()` - Checks if a profile already exists

**Config Writer (src/lib/config/writer.ts)**: Functions for writing configurations:
- `applyProfile(profile)` - Applies profile config (auto-backups first)
- `backupSettings()` - Creates timestamped backup in `~/.claude/cc-switch-backups/`
- `listBackups()` - Lists backup files
- `restoreBackup(file)` - Restores from backup
- `deleteProfile(id)` - Deletes a profile file
- `updateProfile(profile)` - Updates an existing profile

**Config Saver (src/lib/config/saver.ts)**: Save current config as profile (v1.1.0+):
- `saveCurrentConfig()` - Main function for `cc-switch save` command, with full interactive flow
- `quickSaveCurrentConfig(settings)` - Fast save mode for auto-save prompts (minimal interaction)
- `extractKnownFields(env)` - Extracts whitelisted ANTHROPIC_* fields from settings
- `displayDetectedConfig(config, providerType)` - Shows config summary with masked token
- `generateSmartId(providerType, config)` - Generates intelligent default ID from URL or provider type
- `generateSmartName(providerType)` - Generates default name from provider preset
- `findSimilarProfiles(config)` - Detects existing profiles with same base URL or token prefix
- `getSimilarityReason(profile, config)` - Returns human-readable similarity reason
- `maskToken(token)` - Masks sensitive token for display (shows first 7 and last 4 chars)

### Configuration Structure

**Provider Profile** (`~/.claude/profiles/{id}.json`):

```json
{
  "id": "provider-id",
  "name": "Display Name",
  "description": "Optional description",
  "icon": "🎨",
  "config": {
    "env": {
      "ANTHROPIC_AUTH_TOKEN": "token",
      "ANTHROPIC_BASE_URL": "https://api.example.com",
      "ANTHROPIC_DEFAULT_HAIKU_MODEL": "model-name",
      "ANTHROPIC_DEFAULT_SONNET_MODEL": "model-name",
      "ANTHROPIC_DEFAULT_OPUS_MODEL": "model-name",
      "API_TIMEOUT_MS": "30000",
      "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "true"
    }
  }
}
```

**Settings** (`~/.claude/settings.json`): Modified by `applyProfile()` to merge profile env vars.

### Provider Detection Logic

In `loader.ts:41-49`, providers are detected by inspecting `ANTHROPIC_BASE_URL`:
- No URL → "anthropic"
- Contains `open.bigmodel.cn/api/anthropic` → "zhipu-coding"
- Contains `bigmodel.cn` → "zhipu-coding"
- Contains `openrouter.ai` → "openrouter"
- Contains `api.anthropic.com` → "anthropic"
- Contains `workers.dev` → "cloudflare-worker"
- Anything else → "custom"

### Provider Presets

The `creator.ts` module includes 5 built-in provider presets:
- **anthropic** - Official Anthropic API
- **zhipu-coding** - Zhipu GLM Coding Plan (编程套餐)
- **openrouter** - OpenRouter AI (200+ models)
- **cloudflare-worker** - Cloudflare Worker Claude Proxy
- **custom** - Custom API endpoint (requires base URL)

These presets are used by the `cc-switch add` command to quickly create profiles with pre-configured models and settings.

## Adding New Features

### Adding a CLI Command

Add to `src/index.ts`:

```typescript
program
  .command('my-command [args]')
  .description('Description')
  .action(async (args) => {
    // Implementation
  });
```

### Extending the Profile Schema

Modify `src/lib/config/schema.ts` to add new fields to `ProviderProfile` or `Settings` interfaces.

### Adding New Config Operations

Add functions to `loader.ts` (for reading) or `writer.ts` (for writing/backup operations).

## Key Technologies

- **commander** - CLI framework
- **prompts** - Interactive terminal UI
- **chalk** - Terminal styling
- **fs-extra** - File operations
- **ink** - React-like library for terminal UI (reserved for future use)
- **lodash** - Utility library
- **vitest** - Testing framework
- **TypeScript** - Compiled to CommonJS via tsc

## Testing

Vitest is configured for testing:

```bash
npm test            # Run tests in watch mode
npm run test:run    # Run tests once
npm run test:coverage  # Run tests with coverage
```

Manual testing workflow:

```bash
npm link           # Link for testing
cc-switch add      # Add a new profile
cc-switch list     # List profiles
cc-switch current  # Show current config
cc-switch use <id> # Switch provider
cc-switch edit     # Edit a profile
cc-switch delete   # Delete a profile
cc-switch history  # Check backups
cc-switch restore <file>  # Restore backup
```

## Deployment

GitHub Actions automatically publishes to npm when version tags are pushed. See `PUBLISHING_GUIDE.md` for details.

Package name: `@supertiny99/cc-switch`
