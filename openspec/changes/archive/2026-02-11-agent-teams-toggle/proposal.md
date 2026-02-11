## Why

Claude Code 新增了 Agent Teams 功能，允许多个 AI agent 协作完成复杂任务。该功能通过环境变量 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 开启（值为 `"1"`），并有一个 `teammateMode` 配置项控制显示模式（如 `"tmux"`）。目前 ccs 不支持管理这些配置，用户需要手动编辑 settings.json，体验不一致。

## What Changes

- 新增 `ccs agent-teams` 命令组，用于管理 Agent Teams 功能
- 支持开启/关闭 Agent Teams 功能（设置 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 环境变量）
- 支持配置 `teammateMode` 显示模式选项
- 更新 profile 配置白名单，包含 Agent Teams 相关字段
- 在 `ccs current` 输出中显示 Agent Teams 状态

## Capabilities

### New Capabilities

- `agent-teams-toggle`: Agent Teams 功能的开启/关闭管理，包括环境变量设置和状态显示配置

### Modified Capabilities

（无需修改现有能力的需求规格）

## Impact

- **代码变更**：
  - `src/lib/config/schema.ts` - 添加 Agent Teams 相关类型定义
  - `src/index.ts` - 新增 `agent-teams` 命令
  - `src/lib/config/loader.ts` - 读取 Agent Teams 配置
  - `src/lib/config/writer.ts` - 写入 Agent Teams 配置
- **配置变更**：
  - profile 配置白名单需扩展以支持 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`
  - settings.json 需支持 `teammateMode` 配置项
- **用户体验**：用户可通过 `ccs agent-teams on/off` 快速切换功能状态
