## ADDED Requirements

### Requirement: 保存当前配置为 Profile

系统必须提供 `cc-switch save` 命令，允许用户将当前 `~/.claude/settings.json` 中的配置保存为一个新的 profile。

#### Scenario: 成功保存当前配置

- **WHEN** 用户执行 `cc-switch save` 命令
- **THEN** 系统读取当前 settings.json 中的配置
- **THEN** 系统提取已知的 ANTHROPIC_* 字段
- **THEN** 系统检测 provider 类型并显示配置摘要
- **THEN** 系统生成智能默认值（ID、name、icon）
- **THEN** 系统提示用户确认或自定义 profile 信息
- **THEN** 系统将配置保存到 `~/.claude/profiles/<id>.json`
- **THEN** 系统显示成功消息

#### Scenario: 当前配置已保存为已知 Profile

- **WHEN** 用户执行 `cc-switch save` 且当前配置已有对应的 profile ID
- **THEN** 系统显示当前配置已保存为 "<profile-name>"
- **THEN** 系统询问用户是否创建副本
- **THEN** 若用户选择 Yes，继续保存流程
- **THEN** 若用户选择 No，取消操作

#### Scenario: 保存时缺少必需字段

- **WHEN** 用户执行 `cc-switch save` 但 settings.json 缺少 `ANTHROPIC_AUTH_TOKEN`
- **THEN** 系统显示错误消息 "Missing required field: ANTHROPIC_AUTH_TOKEN"
- **THEN** 系统终止保存操作

### Requirement: 提取已知配置字段

系统必须只捕获以下已知字段，避免引入不相关配置：
- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `API_TIMEOUT_MS`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`

#### Scenario: 提取已知字段

- **WHEN** 系统从 settings.env 提取配置
- **THEN** 系统只包含白名单中的字段
- **THEN** 系统忽略其他未知的环境变量

#### Scenario: 可选字段为空时的处理

- **WHEN** settings.env 中不包含可选字段（如 `ANTHROPIC_BASE_URL`）
- **THEN** 系统不在 profile 中包含该字段
- **THEN** 系统继续保存其他已存在的字段

### Requirement: 智能生成 Profile 默认值

系统必须基于检测到的 provider 类型和配置内容，自动生成合理的默认 ID、name 和 icon。

#### Scenario: 为 Custom Provider 生成智能 ID

- **WHEN** 检测到 provider 类型为 `custom` 且 base URL 为 `https://api.example.com`
- **THEN** 系统从 URL 提取域名 `example`
- **THEN** 系统生成默认 ID 为 `example`
- **THEN** 系统生成默认 name 为 `Custom Provider`

#### Scenario: 为已知 Provider 生成默认值

- **WHEN** 检测到 provider 类型为 `zhipu-coding`
- **THEN** 系统生成默认 ID 为 `zhipu-coding`
- **THEN** 系统生成默认 name 为 `Zhipu GLM Coding Plan`
- **THEN** 系统使用对应的 icon `💻`

#### Scenario: URL 解析失败的降级处理

- **WHEN** base URL 格式异常导致解析失败
- **THEN** 系统降级使用 provider 类型作为默认 ID
- **THEN** 系统不中断保存流程

### Requirement: 检测相似配置并警告

系统必须在保存前检测相似配置，并警告用户可能存在重复，但仍允许创建副本。

#### Scenario: 检测到相同 Base URL 的配置

- **WHEN** 用户保存配置，系统检测到已有 profile 使用相同的 `ANTHROPIC_BASE_URL`
- **THEN** 系统显示警告 "Similar configurations found: <profile-name> - same base URL"
- **THEN** 系统询问 "Create new profile anyway?"
- **THEN** 若用户选择 Yes，继续保存
- **THEN** 若用户选择 No，取消操作

#### Scenario: 检测到相同 Token 前缀的配置

- **WHEN** 系统检测到已有 profile 的 token 前 10 个字符与当前配置相同
- **THEN** 系统显示警告 "Similar configurations found: <profile-name> - same token prefix"
- **THEN** 系统询问是否继续

#### Scenario: 未检测到相似配置

- **WHEN** 系统未检测到相似配置
- **THEN** 系统直接进入 profile 信息输入步骤
- **THEN** 系统不显示相似配置警告

### Requirement: 半自动交互模式

系统必须提供半自动交互模式：自动填充智能默认值，同时允许用户自定义所有字段。

#### Scenario: 用户使用默认值

- **WHEN** 系统提示用户输入 Profile ID，显示默认值 `[example]`
- **THEN** 用户直接按 Enter 接受默认值
- **THEN** 系统使用 `example` 作为 profile ID

#### Scenario: 用户自定义值

- **WHEN** 系统提示用户输入 Profile name，显示默认值 `[Custom Provider]`
- **THEN** 用户输入自定义名称 `My API Provider`
- **THEN** 系统使用 `My API Provider` 作为 profile name

#### Scenario: 用户输入的 ID 已存在

- **WHEN** 用户输入 profile ID `anthropic` 但该 profile 已存在
- **THEN** 系统显示验证错误 "Profile 'anthropic' already exists"
- **THEN** 系统要求用户重新输入新的 ID

### Requirement: 安全显示敏感信息

系统必须在显示配置摘要时对 token 进行部分遮罩，保护敏感信息。

#### Scenario: 遮罩显示 Token

- **WHEN** 系统显示检测到的配置摘要，包含 `ANTHROPIC_AUTH_TOKEN: sk-ant-api03-abc123xyz`
- **THEN** 系统显示 `Token: sk-ant-***...***xyz`
- **THEN** 系统隐藏中间部分，只显示前 7 个和后 4 个字符

#### Scenario: Token 过短时完全遮罩

- **WHEN** token 长度小于等于 10 个字符
- **THEN** 系统显示 `Token: ***`
- **THEN** 系统不显示任何实际字符
