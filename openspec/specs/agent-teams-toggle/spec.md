## ADDED Requirements

### Requirement: 显示 Agent Teams 状态

系统必须提供 `ccs agent-teams` 命令，显示当前 Agent Teams 功能的启用状态和配置。

#### Scenario: 显示已启用状态

- **WHEN** 用户执行 `ccs agent-teams` 且 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 为 `"1"`
- **THEN** 系统显示 "Agent Teams: 🟢 Enabled"
- **THEN** 系统显示当前 `teammateMode` 值

#### Scenario: 显示已禁用状态

- **WHEN** 用户执行 `ccs agent-teams` 且 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 不存在或不为 `"1"`
- **THEN** 系统显示 "Agent Teams: ⚫ Disabled"

### Requirement: 开启 Agent Teams 功能

系统必须提供 `ccs agent-teams on` 命令，启用 Agent Teams 功能。

#### Scenario: 成功开启 Agent Teams

- **WHEN** 用户执行 `ccs agent-teams on`
- **THEN** 系统在 settings.json 的 `env` 中设置 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 为 `"1"`
- **THEN** 若 `teammateMode` 不存在，系统设置默认值 `"tmux"`
- **THEN** 系统显示成功消息 "Agent Teams enabled"

#### Scenario: 已开启时再次开启

- **WHEN** 用户执行 `ccs agent-teams on` 且功能已启用
- **THEN** 系统显示 "Agent Teams is already enabled"

### Requirement: 关闭 Agent Teams 功能

系统必须提供 `ccs agent-teams off` 命令，禁用 Agent Teams 功能。

#### Scenario: 成功关闭 Agent Teams

- **WHEN** 用户执行 `ccs agent-teams off`
- **THEN** 系统从 settings.json 的 `env` 中删除 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 键
- **THEN** 系统保留 `teammateMode` 配置（不删除）
- **THEN** 系统显示成功消息 "Agent Teams disabled"

#### Scenario: 已关闭时再次关闭

- **WHEN** 用户执行 `ccs agent-teams off` 且功能已禁用
- **THEN** 系统显示 "Agent Teams is already disabled"

### Requirement: 配置 teammateMode 显示模式

系统必须提供 `ccs agent-teams mode <value>` 命令，配置 Agent Teams 的显示模式。

#### Scenario: 设置 teammateMode 值

- **WHEN** 用户执行 `ccs agent-teams mode tmux`
- **THEN** 系统在 settings.json 中设置 `teammateMode` 为 `"tmux"`
- **THEN** 系统显示成功消息 "Teammate mode set to: tmux"

#### Scenario: 查看当前 teammateMode

- **WHEN** 用户执行 `ccs agent-teams mode` 且不提供值
- **THEN** 系统显示当前 `teammateMode` 值
- **THEN** 若未设置，系统显示 "Teammate mode: (not set)"

### Requirement: 在 current 命令中显示 Agent Teams 状态

系统必须在 `ccs current` 输出中包含 Agent Teams 的启用状态。

#### Scenario: current 命令显示 Agent Teams 状态

- **WHEN** 用户执行 `ccs current`
- **THEN** 系统在输出末尾显示 Agent Teams 状态行
- **THEN** 格式为 "Agent Teams: Enabled (mode: tmux)" 或 "Agent Teams: Disabled"
