# cc-switch

[English](README.en.md) | [中文](README.md)

> A TUI tool for quickly switching Claude Code API providers

When your token quota is exhausted, you can quickly switch to another provider/token.

## Features

- 🔄 **Quick Switch** - Complete provider switch in 1-2 seconds
- 🎨 **Interactive Selection** - Friendly interface with fuzzy search support
- 🔒 **Auto Backup** - Automatically backs up config before each switch
- 💾 **Save Current Config** - Quickly save externally modified configs as new profiles
- 🔔 **Smart Prompts** - Auto-prompt to save unsaved configs before switching
- 🤖 **Agent Teams** - One-click enable/disable Claude Code's Agent Teams feature
- 📦 **Extensible** - Reserved interfaces for MCP, skills, and plugin switching
- 🌍 **Multi-provider** - Supports any Anthropic API-compatible provider

## Installation

### Global Installation

```bash
npm install -g @supertiny99/cc-switch
```

After installation, you can use either `cc-switch` or the shorter alias `ccs` (both are fully equivalent).

### Local Development

```bash
git clone <repo-url>
cd cc-switch
npm install
npm link  # Link to local environment
```

## Update

### Update to Latest Version

```bash
npm update -g @supertiny99/cc-switch
```

Or:

```bash
npm install -g @supertiny99/cc-switch@latest
```

### Check Current Version

```bash
ccs --version
# or
cc-switch --version
```

### View Available Versions

```bash
npm view @supertiny99/cc-switch versions
```

## Quick Start

> **Tip**: All commands can use `ccs` instead of `cc-switch`, e.g., `ccs list`, `ccs use`, etc.

### 1. Check Current Configuration

```bash
ccs current
```

Output:
```
Current Configuration:
  Provider: zhipu
  Base URL: https://open.bigmodel.cn/api/anthropic
  Haiku Model: GLM-4.5-Air
  Sonnet Model: GLM-4.7
  Opus Model: GLM-4.7
```

### 2. List All Providers

```bash
ccs list
```

### 3. Interactive Switch

```bash
ccs
```

Type `zh` to quickly locate "Zhipu AI", then press Enter to confirm.

### 4. Switch to Specified Provider

```bash
ccs use anthropic
```

Or use interactive selection:

```bash
ccs use
```

### 5. Save Current Configuration

When external tools (like API proxies or other config management tools) directly modify `~/.claude/settings.json`, you can use the `save` command to save the current configuration as a new profile:

```bash
ccs save
```

The command will:
- Automatically detect the current provider type (Anthropic, Zhipu, OpenRouter, etc.)
- Extract known configuration fields (token, base URL, model names, etc.)
- Generate smart default ID and name (customizable)
- Detect similar configurations and warn (avoid duplicates)
- Mask sensitive token information for security

Example output:
```
📦 Current Configuration Detected

Provider: Custom Provider
Base URL: http://127.0.0.1:8045
Haiku:    gemini-3-flash
Sonnet:   claude-sonnet-4-5
Token:    sk-d7f0...6060

? Profile ID: › example-proxy
? Profile name: › Example Proxy
? Description (optional): ›
? Icon: › 🔌

✓ Saved as "Example Proxy" (example-proxy)
```

**Auto-save prompt**: When executing `ccs use` to switch configurations, if the current config is not saved, the system will automatically prompt whether to save:

```bash
$ ccs use anthropic

⚠️  Current configuration is not saved
? Save current config before switching? (Y/n) › Yes

? Profile ID: › my-config
? Profile name: › My Config
✓ Saved as "My Config"

# Then continue with the switch operation...
```

## Configuration Files

Provider profiles are located in `~/.claude/profiles/`:

```
~/.claude/
├── settings.json              # Current Claude Code configuration
├── profiles/                  # Provider configuration directory
│   ├── zhipu.json            # Zhipu AI (GLM)
│   ├── anthropic.json        # Anthropic Official
│   └── custom.json           # Custom provider
└── cc-switch-backups/        # Auto backup directory
```

### Creating a Custom Provider

Create a JSON file in `~/.claude/profiles/`:

```json
{
  "id": "my-provider",
  "name": "My Provider",
  "description": "Custom API provider",
  "icon": "🚀",
  "config": {
    "env": {
      "ANTHROPIC_AUTH_TOKEN": "your_token_here",
      "ANTHROPIC_BASE_URL": "https://your-api-endpoint.com",
      "ANTHROPIC_DEFAULT_HAIKU_MODEL": "model-name",
      "ANTHROPIC_DEFAULT_OPUS_MODEL": "model-name",
      "ANTHROPIC_DEFAULT_SONNET_MODEL": "model-name"
    }
  }
}
```

## Command Reference

> **Tip**: All `cc-switch` commands can use `ccs` as an alias.

| Command | Description |
|---------|-------------|
| `ccs` / `cc-switch` | Interactive provider selection |
| `ccs add` | Add a new provider profile |
| `ccs save` | **Save current config as new profile** (use after external tools modify config) |
| `ccs use [profile-id]` | Switch to specified provider (optional argument, interactive if not provided)<br/>**Auto-detect unsaved configs and prompt to save** |
| `ccs list` | List all available providers |
| `ccs current` | Display current configuration |
| `cc-switch edit` / `cc-switch modify` | Edit an existing provider profile |
| `cc-switch delete` / `cc-switch rm` | Delete a provider profile |
| `cc-switch history` | View backup history |
| `cc-switch restore <file>` | Restore from backup |
| `ccs agent-teams` | Display Agent Teams status |
| `ccs agent-teams on` | Enable Agent Teams feature |
| `ccs agent-teams off` | Disable Agent Teams feature |
| `ccs agent-teams mode [value]` | View or set teammateMode |
| `cc-switch --version` | Display version number |
| `cc-switch --help` | Display help information |

## Agent Teams Management

Claude Code's Agent Teams feature allows multiple AI agents to collaborate on complex tasks. ccs provides convenient commands to manage this feature.

### View Status

```bash
ccs agent-teams
```

Example output:
```
Agent Teams Status:
  Status: 🟢 Enabled
  Mode: tmux
```

### Enable/Disable

```bash
# Enable Agent Teams (sets CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)
ccs agent-teams on

# Disable Agent Teams (removes the environment variable)
ccs agent-teams off
```

### Configure Display Mode

```bash
# View current mode
ccs agent-teams mode

# Set mode (e.g., tmux)
ccs agent-teams mode tmux
```

### Related Configuration

After enabling Agent Teams, the following configuration is added to settings.json:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "teammateMode": "tmux"
}
```

## Development

### Project Structure

```
cc-switch/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── lib/
│   │   └── config/
│   │       ├── schema.ts      # Type definitions
│   │       ├── loader.ts      # Config reading
│   │       ├── writer.ts      # Config writing (with backup)
│   │       ├── creator.ts     # Profile creation (preset templates)
│   │       └── saver.ts       # Save current config (v1.1.0+)
│   └── ui/
│       └── quick-select.ts    # Interactive selection
├── package.json
├── tsconfig.json
└── README.md
```

### Development Commands

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev list

# Build
npm run build

# Local testing
npm link
cc-switch list

# Run tests
npm test
```

### Adding New Features

1. **Add CLI Command** - Add in `src/index.ts`:
```typescript
program
  .command('my-command')
  .description('My command')
  .action(async () => {
    // Your logic
  });
```

2. **Add Config Items** - Extend types in `src/lib/config/schema.ts`

3. **Add UI Components** - Create new files in `src/ui/`

## Testing

### Manual Testing Checklist

```bash
# 1. Test listing providers
cc-switch list

# 2. Test displaying current config
cc-switch current

# 3. Test switching providers
cc-switch use anthropic
cc-switch current  # Verify switch

# 4. Test backup function
cc-switch history

# 5. Test restoring backup
cc-switch restore settings-2025-01-29T14-30-22-123Z.json

# 6. Test interactive selection
cc-switch  # Press Ctrl+C to cancel
```

### Unit Tests (To Be Implemented)

```bash
npm test
```

## Publishing to npm

### 1. Prepare for Release

```bash
# Ensure build is complete
npm run build

# Check package.json configuration
cat package.json
```

### 2. npm Account Setup

```bash
# Login to npm (first time only)
npm login

# Or login using token
npm token create
npm logout
npm login --registry=https://registry.npmjs.org --auth-only
```

### 3. Check Package Name Availability

```bash
npm search @supertiny99/cc-switch
# Or visit https://www.npmjs.com/package/@supertiny99/cc-switch
```

### 4. Release Process

```bash
# 1. Update version number
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 2. Publish to npm
npm publish

# 3. Verify release
npm view @supertiny99/cc-switch
```

### 5. Release Options

```bash
# Public release (default)
npm publish

# Publish as scoped package (@scope/package-name)
npm publish --access public

# Dry run (don't actually publish)
npm publish --dry-run

# Publish with specific tag
npm publish --tag beta
```

### 6. Post-Release Verification

```bash
# Global installation test
npm install -g @supertiny99/cc-switch

# Or run directly with npx
npx @supertiny99/cc-switch list
```

## Release Checklist

- [ ] Update package.json version number
- [ ] Run `npm run build` to ensure successful build
- [ ] Update README.md documentation
- [ ] Add LICENSE file
- [ ] Test all commands work properly
- [ ] Confirm package name is not taken
- [ ] Check .npmignore excludes unnecessary files

## Troubleshooting

### Command Not Found

```bash
# Re-link
npm link

# Or check global path
which cc-switch
```

### Configuration File Error

```bash
# View backups
cc-switch history

# Restore backup
cc-switch restore <backup-file>
```

### Permission Issues

```bash
# macOS/Linux may need sudo
sudo npm link
```

## Compatibility

- Node.js >= 16.0.0
- macOS, Linux, Windows

## License

MIT

## Contributing

Issues and Pull Requests are welcome!

## Roadmap

- [ ] MCP server switching
- [ ] Skill enable/disable
- [ ] Plugin management
- [ ] Full TUI interface (using Ink)
- [ ] Configuration validation
- [ ] Unit tests

## Related Links

- [Claude Code](https://github.com/anthropics/claude-code)
- [Anthropic API](https://docs.anthropic.com/)
