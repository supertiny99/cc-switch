## Context

ccs 是一个用于快速切换 Claude Code API 提供商配置的 TUI 工具。当前支持管理 `env` 中的 API 相关环境变量（如 `ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_BASE_URL` 等），但不支持管理 Claude Code 的实验性功能配置。

Claude Code 新增了 Agent Teams 功能，需要：
- 环境变量 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 设置为 `"1"` 来启用
- 顶级配置 `teammateMode` 设置显示模式（如 `"tmux"`）

当前 settings.json 结构示例：
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "...",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "teammateMode": "tmux"
}
```

## Goals / Non-Goals

**Goals:**
- 提供 `ccs agent-teams` 命令组，支持开启/关闭 Agent Teams 功能
- 支持配置 `teammateMode` 显示模式
- 在 `ccs current` 中显示 Agent Teams 状态
- 保持与现有配置管理逻辑的一致性

**Non-Goals:**
- 不管理 Agent Teams 的其他高级配置
- 不修改 profile 系统（Agent Teams 是全局功能，不与 profile 绑定）
- 不实现 Agent Teams 运行时状态监控

## Decisions

### Decision 1: 命令结构设计

**选择**: 使用 `ccs agent-teams <subcommand>` 命令组

**子命令**:
- `ccs agent-teams` - 显示当前状态
- `ccs agent-teams on` - 开启 Agent Teams
- `ccs agent-teams off` - 关闭 Agent Teams
- `ccs agent-teams mode [tmux|...]` - 设置显示模式

**替代方案**: 使用 `ccs config set agent-teams.enabled true` 通用配置命令
**选择理由**: 专用命令更直观，减少用户输入，符合 ccs 现有命令风格（如 `ccs use`、`ccs save`）

### Decision 2: 配置存储位置

**选择**: 直接修改 `~/.claude/settings.json`，不存入 profile

**理由**:
- Agent Teams 是全局实验性功能，与 API 提供商无关
- 切换 profile 时不应影响 Agent Teams 状态
- 保持 profile 的单一职责（只管理 API 配置）

### Decision 3: 开启/关闭实现方式

**选择**: 开启时添加环境变量，关闭时删除环境变量

- **开启**: 设置 `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"`
- **关闭**: 删除 `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 键

**替代方案**: 设置为 `"0"` 来关闭
**选择理由**: 删除键更干净，与 Claude Code 默认行为一致（无该键时功能关闭）

### Decision 4: teammateMode 配置处理

**选择**: 作为顶级配置项处理，非 env 变量

**实现**:
- 开启 Agent Teams 时，默认设置 `teammateMode: "tmux"`
- 提供 `ccs agent-teams mode <value>` 修改
- 关闭 Agent Teams 时保留 `teammateMode`（用户下次开启时保持偏好）

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| Claude Code 更改配置字段名 | 使用常量定义字段名，便于后续更新 |
| teammateMode 有新的可选值 | 不校验值，允许用户输入任意字符串 |
| 与其他工具冲突修改 settings.json | 每次操作前读取最新配置，避免覆盖 |

## Implementation Notes

### 文件变更

1. **`src/lib/config/schema.ts`** - 扩展 `Settings` 类型，添加 `teammateMode` 字段
2. **`src/index.ts`** - 新增 `agent-teams` 命令组
3. **`src/lib/config/agent-teams.ts`** (新建) - Agent Teams 配置读写逻辑
4. **`src/lib/config/loader.ts`** - 添加读取 Agent Teams 状态的辅助函数

### 输出格式

`ccs agent-teams` 状态显示：
```
Agent Teams: 🟢 Enabled
Mode: tmux
```

或：
```
Agent Teams: ⚫ Disabled
```
