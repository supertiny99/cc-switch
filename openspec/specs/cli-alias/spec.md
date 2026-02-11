# CLI Alias (cli-alias)

## Purpose

This capability defines command alias support for the `cc-switch` CLI tool, providing a shorter `ccs` command as a convenient alternative to the full `cc-switch` command name.

## Requirements

### Requirement: ccs 命令作为 cc-switch 的别名

系统必须提供 `ccs` 命令作为 `cc-switch` 的完全等价别名，支持所有现有的命令和参数。

#### Scenario: 使用 ccs 执行基本命令

- **WHEN** 用户在终端输入 `ccs` 命令
- **THEN** 系统显示与 `cc-switch` 相同的帮助信息和可用命令列表

#### Scenario: 使用 ccs 执行子命令

- **WHEN** 用户输入 `ccs add` 添加新配置
- **THEN** 系统启动与 `cc-switch add` 相同的交互式配置流程

#### Scenario: 使用 ccs 执行带参数的命令

- **WHEN** 用户输入 `ccs use my-profile`
- **THEN** 系统切换到指定配置，效果与 `cc-switch use my-profile` 完全一致

#### Scenario: 使用 ccs 执行所有子命令

- **WHEN** 用户使用 `ccs` 执行任意子命令（list、delete、edit、save、current、history、restore）
- **THEN** 系统执行相应操作，行为与使用 `cc-switch` 前缀完全一致

### Requirement: 保持向后兼容性

系统必须继续支持原有的 `cc-switch` 命令，确保现有用户的工作流不受影响。

#### Scenario: cc-switch 命令继续可用

- **WHEN** 用户在终端输入 `cc-switch` 相关命令
- **THEN** 系统正常执行，功能和行为保持不变

#### Scenario: 两个命令共存

- **WHEN** 用户在同一系统中混合使用 `ccs` 和 `cc-switch` 命令
- **THEN** 两个命令都能正常工作，操作相同的配置文件和数据

### Requirement: npm 包安装后自动配置别名

系统必须在 npm 包安装后自动创建 `ccs` 命令的可执行符号链接。

#### Scenario: 全局安装后别名可用

- **WHEN** 用户执行 `npm install -g @supertiny99/cc-switch`
- **THEN** 系统同时创建 `cc-switch` 和 `ccs` 两个全局命令

#### Scenario: 局部安装后别名可用

- **WHEN** 用户在项目中执行 `npm install @supertiny99/cc-switch`
- **THEN** 系统在 `node_modules/.bin/` 中创建 `cc-switch` 和 `ccs` 两个可执行文件

#### Scenario: npx 方式使用别名

- **WHEN** 用户执行 `npx ccs <command>`
- **THEN** 系统正常执行命令，无需全局安装

### Requirement: 帮助信息中展示别名

系统的帮助信息和错误提示必须提及 `ccs` 别名，帮助用户了解这个便捷选项。

#### Scenario: 帮助信息提及别名

- **WHEN** 用户查看命令帮助（`ccs --help` 或 `cc-switch --help`）
- **THEN** 帮助信息中说明两个命令名称都可使用

#### Scenario: 版本信息一致

- **WHEN** 用户执行 `ccs --version` 或 `cc-switch --version`
- **THEN** 系统显示相同的版本号
