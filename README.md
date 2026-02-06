# cc-switch

[English](README.en.md) | [中文](README.md)

> 快速切换 Claude Code API 提供商的 TUI 工具

当 token 额度用尽时，可以快速切换到另一个提供商/token。

## 功能特性

- 🔄 **快速切换** - 1-2 秒内完成提供商切换
- 🎨 **交互式选择** - 支持模糊搜索的友好界面
- 🔒 **自动备份** - 每次切换前自动备份配置
- 📦 **可扩展** - 预留 MCP、技能、插件切换接口
- 🌍 **多提供商** - 支持任意兼容 Anthropic API 的提供商

## 安装

### 全局安装

```bash
npm install -g @supertiny99/cc-switch
```

### 本地开发

```bash
git clone <repo-url>
cd cc-switch
npm install
npm link  # 链接到本地环境
```

## 更新

### 更新到最新版本

```bash
npm update -g @supertiny99/cc-switch
```

或者

```bash
npm install -g @supertiny99/cc-switch@latest
```

### 检查当前版本

```bash
cc-switch --version
```

### 查看可用版本

```bash
npm view @supertiny99/cc-switch versions
```

## 快速开始

### 1. 查看当前配置

```bash
cc-switch current
```

输出：
```
Current Configuration:
  Provider: zhipu
  Base URL: https://open.bigmodel.cn/api/anthropic
  Haiku Model: GLM-4.5-Air
  Sonnet Model: GLM-4.7
  Opus Model: GLM-4.7
```

### 2. 列出所有提供商

```bash
cc-switch list
```

### 3. 交互式切换

```bash
cc-switch
```

输入 `zh` 即可快速定位到 "Zhipu AI"，按 Enter 确认。

### 4. 直接切换到指定提供商

```bash
cc-switch use anthropic
```

或使用交互式选择：

```bash
cc-switch use
```

## 配置文件

提供商配置文件位于 `~/.claude/profiles/`：

```
~/.claude/
├── settings.json              # Claude Code 当前配置
├── profiles/                  # 提供商配置目录
│   ├── zhipu.json            # 智谱 AI (GLM)
│   ├── anthropic.json        # Anthropic 官方
│   └── custom.json           # 自定义提供商
└── cc-switch-backups/        # 自动备份目录
```

### 创建自定义提供商

在 `~/.claude/profiles/` 创建 JSON 文件：

```json
{
  "id": "my-provider",
  "name": "我的提供商",
  "description": "自定义 API 提供商",
  "icon": "🚀",
  "config": {
    "env": {
      "ANTHROPIC_AUTH_TOKEN": "your_token_here",
      "ANTHROPIC_BASE_URL": "https://your-api-endpoint.com",
      "ANTHROPIC_DEFAULT_HAIKU_MODEL": "model-name",
      "ANTHROPIC_DEFAULT_OPUS_MODEL": "model-name",
      "ANTHROPIC_DEFAULT_SONNET_MODEL": "model-name"
    }
  }
}
```

## 命令参考

| 命令 | 说明 |
|------|------|
| `cc-switch` | 交互式选择提供商 |
| `cc-switch add` | 添加新的提供商配置 |
| `cc-switch use [profile-id]` | 切换到指定提供商（可选参数，不提供则交互式选择） |
| `cc-switch list` | 列出所有可用提供商 |
| `cc-switch current` | 显示当前配置 |
| `cc-switch edit` / `cc-switch modify` | 编辑现有提供商配置 |
| `cc-switch delete` / `cc-switch rm` | 删除提供商配置 |
| `cc-switch history` | 查看备份历史 |
| `cc-switch restore <file>` | 从备份恢复 |
| `cc-switch --version` | 显示版本号 |
| `cc-switch --help` | 显示帮助信息 |

## 开发

### 项目结构

```
cc-switch/
├── src/
│   ├── index.ts              # CLI 入口
│   ├── lib/
│   │   └── config/
│   │       ├── schema.ts      # 类型定义
│   │       ├── loader.ts      # 配置读取
│   │       └── writer.ts      # 配置写入（含备份）
│   └── ui/
│       └── quick-select.ts    # 交互式选择
├── package.json
├── tsconfig.json
└── README.md
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev list

# 构建
npm run build

# 本地测试
npm link
cc-switch list

# 运行测试
npm test
```

### 添加新功能

1. **新增 CLI 命令** - 在 `src/index.ts` 添加：
```typescript
program
  .command('my-command')
  .description('我的命令')
  .action(async () => {
    // 你的逻辑
  });
```

2. **新增配置项** - 在 `src/lib/config/schema.ts` 扩展类型

3. **新增 UI 组件** - 在 `src/ui/` 创建新文件

## 测试

### 手动测试清单

```bash
# 1. 测试列出提供商
cc-switch list

# 2. 测试显示当前配置
cc-switch current

# 3. 测试切换提供商
cc-switch use anthropic
cc-switch current  # 验证已切换

# 4. 测试备份功能
cc-switch history

# 5. 测试恢复备份
cc-switch restore settings-2025-01-29T14-30-22-123Z.json

# 6. 测试交互式选择
cc-switch  # 按 Ctrl+C 取消
```

### 单元测试（待实现）

```bash
npm test
```

## 发布到 npm

### 1. 准备发布

```bash
# 确保已构建
npm run build

# 检查 package.json 配置
cat package.json
```

### 2. npm 账号设置

```bash
# 登录 npm（首次需要）
npm login

# 或使用 token 登录
npm token create
npm logout
npm login --registry=https://registry.npmjs.org --auth-only
```

### 3. 检查包名是否可用

```bash
npm search @supertiny99/cc-switch
# 或访问 https://www.npmjs.com/package/@supertiny99/cc-switch
```

### 4. 发布流程

```bash
# 1. 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 2. 发布到 npm
npm publish

# 3. 验证发布
npm view @supertiny99/cc-switch
```

### 5. 发布选项

```bash
# 公开发布（默认）
npm publish

# 作为一个包的发布范围（@scope/package-name）
npm publish --access public

# 干运行（不实际发布）
npm publish --dry-run

# 发布特定 tag
npm publish --tag beta
```

### 6. 发布后验证

```bash
# 全局安装测试
npm install -g @supertiny99/cc-switch

# 或使用 npx 直接运行
npx @supertiny99/cc-switch list
```

## 发布检查清单

- [ ] 更新 package.json 版本号
- [ ] 运行 `npm run build` 确保构建成功
- [ ] 更新 README.md 文档
- [ ] 添加 LICENSE 文件
- [ ] 测试所有命令功能正常
- [ ] 确认包名未被占用
- [ ] 检查 .npmignore 排除不必要的文件

## 故障排除

### 命令未找到

```bash
# 重新链接
npm link

# 或检查全局路径
which cc-switch
```

### 配置文件错误

```bash
# 查看备份
cc-switch history

# 恢复备份
cc-switch restore <backup-file>
```

### 权限问题

```bash
# macOS/Linux 可能需要 sudo
sudo npm link
```

## 兼容性

- Node.js >= 16.0.0
- macOS, Linux, Windows

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 路线图

- [ ] MCP 服务器切换
- [ ] 技能启用/禁用
- [ ] 插件管理
- [ ] 完整 TUI 界面（使用 Ink）
- [ ] 配置验证
- [ ] 单元测试

## 相关链接

- [Claude Code](https://github.com/anthropics/claude-code)
- [Anthropic API](https://docs.anthropic.com/)
