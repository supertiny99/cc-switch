## Why

当其他工具直接修改 `~/.claude/settings.json` 时，这些配置变更无法被 cc-switch 管理。用户需要一种快速方式将当前配置保存为 profile，避免在切换 provider 时丢失外部工具的配置。同时，在切换前自动提示保存可以防止意外丢失未保存的配置。

## What Changes

- 新增 `cc-switch save` 命令，用于快速保存当前配置为新的 profile
- 在 `cc-switch use` 命令执行前，检测当前配置是否为 unknown，若是则提示用户保存
- 智能检测 provider 类型，自动生成合理的 profile ID 和名称
- 检测并警告相似配置（相同 base URL 或 token 前缀），允许用户创建副本
- 只捕获已知的 ANTHROPIC_* 相关字段，避免引入不相关配置
- 半自动交互模式：自动填充默认值，允许用户自定义

## Capabilities

### New Capabilities

- `save-current-config`: 将当前 settings.json 中的配置保存为 cc-switch profile
- `auto-save-prompt`: 在切换 profile 前自动检测并提示保存 unknown 配置

### Modified Capabilities

无现有能力需要修改需求。

## Impact

**影响的代码模块**:
- `src/index.ts`: 新增 `save` 命令，修改 `use` 命令逻辑
- `src/lib/config/`: 新增 `saver.ts` 模块

**新增功能**:
- 配置提取：从 settings.env 提取已知字段
- 智能生成：基于 provider 类型和 URL 生成默认 ID/name
- 去重检测：查找相似配置并警告
- Token 遮罩：安全显示敏感信息

**用户体验变化**:
- 外部工具修改配置后，可通过 `cc-switch save` 快速保存
- 切换 provider 前，如检测到 unknown 配置会主动提示保存
- 减少配置丢失风险，提升工具易用性
