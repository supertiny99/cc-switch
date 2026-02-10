## Why

当前用户需要输入完整的 `cc-switch` 命令，对于频繁使用的场景显得冗长。添加更短的 `ccs` 别名可以显著提升用户体验和输入效率，让用户能够更快速地切换 API 提供商。

## What Changes

- 添加新的 `ccs` 命令作为 `cc-switch` 的简短别名
- `ccs` 支持所有现有的 `cc-switch` 命令和子命令（如 `ccs add`、`ccs list`、`ccs use` 等）
- 保持完全向后兼容，`cc-switch` 命令继续正常工作
- 两个命令完全等价，用户可以根据个人偏好选择使用

## Capabilities

### New Capabilities

- `cli-alias`: CLI 命令别名机制，允许用户通过更短的命令名 `ccs` 调用所有 `cc-switch` 功能

### Modified Capabilities

无现有功能需求变更。

## Impact

- **代码影响**: 需要修改 `package.json` 的 `bin` 配置，添加 `ccs` 作为新的可执行入口点
- **文档影响**: 需要更新 README.md 和相关文档，说明 `ccs` 别名的使用方法
- **用户影响**: 用户获得更便捷的命令输入方式，无破坏性变更
- **依赖影响**: 无新增外部依赖
