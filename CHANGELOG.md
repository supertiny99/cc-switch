# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-10

### Added

- **`ccs` 命令别名** - 添加了 `ccs` 作为 `cc-switch` 的简短别名，两个命令完全等价
  - 所有子命令都支持：`ccs add`, `ccs list`, `ccs use`, `ccs save` 等
  - 保持向后兼容，`cc-switch` 命令继续正常工作
  - 用户可以根据个人偏好选择使用任一命令
- 更新了所有文档（README.md, README.en.md, CLAUDE.md）优先展示 `ccs` 命令示例
- CLI 帮助信息中说明了 `ccs` 别名的可用性

### Changed

- 文档示例优先使用更简洁的 `ccs` 命令
- CLI 帮助描述更新为："Quick Claude Code configuration switcher (also available as \"ccs\")"

## [1.1.0] - 2025-01-XX

### Added

- **保存当前配置功能** (`save` 命令)
  - 支持将外部工具修改的配置快速保存为新 profile
  - 智能检测 provider 类型和配置字段
  - 自动生成默认 ID 和名称
  - 检测相似配置并提示
  - 遮罩显示敏感 token 信息
- **自动保存提示**
  - `use` 命令切换前自动检测未保存配置
  - 提示用户是否保存当前配置
  - 快速保存模式（最小交互）

### Changed

- 改进了配置检测逻辑
- 优化了用户交互流程

## [1.0.0] - 2025-01-XX

### Added

- 初始版本发布
- 交互式提供商切换
- 自动配置备份
- 多提供商支持（Anthropic、Zhipu GLM Coding、OpenRouter、Cloudflare Worker、Custom）
- 配置文件管理（add、delete、edit、list、current）
- 备份历史和恢复功能

[1.2.0]: https://github.com/supertiny99/cc-switch/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/supertiny99/cc-switch/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supertiny99/cc-switch/releases/tag/v1.0.0
