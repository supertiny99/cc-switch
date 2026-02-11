## 1. 类型定义

- [x] 1.1 在 `src/lib/config/schema.ts` 中扩展 `Settings` 类型，添加 `teammateMode?: string` 字段

## 2. 核心逻辑

- [x] 2.1 创建 `src/lib/config/agent-teams.ts` 模块，实现 Agent Teams 配置读写逻辑
- [x] 2.2 实现 `getAgentTeamsStatus()` 函数，读取当前启用状态和 teammateMode
- [x] 2.3 实现 `enableAgentTeams()` 函数，设置环境变量并初始化默认 teammateMode
- [x] 2.4 实现 `disableAgentTeams()` 函数，删除环境变量（保留 teammateMode）
- [x] 2.5 实现 `setTeammateMode(value: string)` 函数，更新 teammateMode 配置

## 3. CLI 命令

- [x] 3.1 在 `src/index.ts` 中添加 `agent-teams` 命令组
- [x] 3.2 实现 `ccs agent-teams` 默认行为（显示状态）
- [x] 3.3 实现 `ccs agent-teams on` 子命令
- [x] 3.4 实现 `ccs agent-teams off` 子命令
- [x] 3.5 实现 `ccs agent-teams mode [value]` 子命令

## 4. 集成 current 命令

- [x] 4.1 修改 `ccs current` 命令，在输出末尾显示 Agent Teams 状态

## 5. 测试验证

- [x] 5.1 手动测试 `ccs agent-teams` 状态显示
- [x] 5.2 手动测试 `ccs agent-teams on/off` 开关功能
- [x] 5.3 手动测试 `ccs agent-teams mode` 模式配置
- [x] 5.4 手动测试 `ccs current` 包含 Agent Teams 状态
