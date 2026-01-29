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
npm link

# Unlink after testing
npm unlink -g cc-switch

# Publish to npm (automated via GitHub Actions)
npm version patch|minor|major
git push origin main
git push origin v1.x.x
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
│   └── writer.ts         # Config writing + backup/restore
└── ui/
    └── quick-select.ts   # Interactive TUI (prompts library)
```

### Key Modules

**CLI Commands (src/index.ts)**: Defines all CLI commands using Commander.js:
- `cc-switch` - Interactive provider selection
- `cc-switch use <id>` - Direct switch to profile
- `cc-switch list` - List available profiles
- `cc-switch current` - Show current config
- `cc-switch history` - Show backup history
- `cc-switch restore <file>` - Restore from backup

**Config Loader (src/lib/config/loader.ts)**: Functions for reading configurations:
- `loadSettings()` - Reads `~/.claude/settings.json`
- `loadProfile(id)` - Reads `~/.claude/profiles/{id}.json`
- `listProfiles()` - Lists all available profiles
- `getCurrentProvider(settings)` - Detects current provider from BASE_URL

**Config Writer (src/lib/config/writer.ts)**: Functions for writing configurations:
- `applyProfile(profile)` - Applies profile config (auto-backups first)
- `backupSettings()` - Creates timestamped backup in `~/.claude/cc-switch-backups/`
- `listBackups()` - Lists backup files
- `restoreBackup(file)` - Restores from backup

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
      "ANTHROPIC_DEFAULT_OPUS_MODEL": "model-name"
    }
  }
}
```

**Settings** (`~/.claude/settings.json`): Modified by `applyProfile()` to merge profile env vars.

### Provider Detection Logic

In `loader.ts:41-47`, providers are detected by inspecting `ANTHROPIC_BASE_URL`:
- No URL → "anthropic"
- Contains "bigmodel.cn" → "zhipu"
- Contains "api.anthropic.com" → "anthropic"
- Anything else → "custom"

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
- **TypeScript** - Compiled to CommonJS via tsc

## Testing

No automated tests exist. Manual testing workflow:

```bash
npm link           # Link for testing
cc-switch list     # List profiles
cc-switch current  # Show current config
cc-switch use <id> # Switch provider
cc-switch history  # Check backups
cc-switch restore <file>  # Restore backup
```

## Deployment

GitHub Actions automatically publishes to npm when version tags are pushed. See `PUBLISHING_GUIDE.md` for details.

Package name: `@supertiny99/cc-switch`
