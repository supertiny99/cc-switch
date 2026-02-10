## ADDED Requirements

### Requirement: 切换前检测未保存配置

系统必须在执行 `cc-switch use` 命令时，检测当前配置是否为 unknown（未保存为任何 profile），并在切换前提示用户保存。

#### Scenario: 检测到 Unknown 配置时提示保存

- **WHEN** 用户执行 `cc-switch use <profile-id>` 命令
- **THEN** 系统检查当前配置的 profile ID
- **THEN** 若当前配置为 unknown（无对应 profile ID），系统显示警告 "Current configuration is not saved"
- **THEN** 系统询问 "Save current config before switching? (Y/n)"
- **THEN** 若用户选择 Yes，进入快速保存流程
- **THEN** 若用户选择 No，直接执行切换操作

#### Scenario: 当前配置已保存时直接切换

- **WHEN** 用户执行 `cc-switch use <profile-id>` 且当前配置已有对应 profile ID
- **THEN** 系统不显示保存提示
- **THEN** 系统直接执行切换操作

#### Scenario: 用户取消保存提示

- **WHEN** 系统提示保存，用户按 Ctrl+C 或关闭终端
- **THEN** 系统取消整个 use 命令
- **THEN** 系统不执行切换操作

### Requirement: 快速保存模式

系统必须提供快速保存模式，在 auto-save 提示时使用，减少交互步骤，只要求必需信息。

#### Scenario: 快速保存流程

- **WHEN** 用户在 auto-save 提示时选择保存
- **THEN** 系统只提示输入 Profile ID（带智能默认值）
- **THEN** 系统只提示输入 Profile name（带智能默认值）
- **THEN** 系统自动使用检测到的 icon（不询问）
- **THEN** 系统自动跳过 description（不询问）
- **THEN** 系统保存 profile 并显示成功消息
- **THEN** 系统继续执行切换操作

#### Scenario: 快速保存时 ID 冲突

- **WHEN** 快速保存时，默认 ID 与已有 profile 冲突
- **THEN** 系统捕获 `saveProfile()` 抛出的异常
- **THEN** 系统提示用户 "Profile '<id>' already exists"
- **THEN** 系统要求用户手动输入新的 ID
- **THEN** 系统继续保存流程

#### Scenario: 快速保存后继续切换

- **WHEN** 快速保存成功完成
- **THEN** 系统显示 "✓ Saved as '<name>'"
- **THEN** 系统自动继续执行原有的 `cc-switch use` 切换逻辑
- **THEN** 系统切换到目标 profile

### Requirement: 保持向后兼容

系统必须确保 auto-save 功能不影响现有的 `cc-switch use` 命令行为。

#### Scenario: 无交互使用时的兼容性

- **WHEN** 用户在脚本中使用 `cc-switch use <profile-id>` 且当前配置为 unknown
- **THEN** 系统仍然会提示保存（阻塞等待输入）
- **THEN** 用户可以通过输入 'n' 跳过保存
- **THEN** 系统继续执行切换

#### Scenario: 已知配置的行为不变

- **WHEN** 用户执行 `cc-switch use` 且当前配置已保存
- **THEN** 系统行为与之前完全一致
- **THEN** 系统不引入任何额外提示或延迟
