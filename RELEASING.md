# 发布指南

本项目使用 GitHub Actions 自动发布到 npm。

## 发布流程

### 1. 更新版本号

使用 npm version 命令更新版本号，这会自动：
- 更新 `package.json` 中的版本号
- 创建 git commit
- 创建 git tag
- 推送到 GitHub

```bash
# 补丁版本 (bug 修复): 1.2.0 -> 1.2.1
npm version patch

# 次要版本 (新功能): 1.2.0 -> 1.3.0
npm version minor

# 主要版本 (破坏性变更): 1.2.0 -> 2.0.0
npm version major
```

### 2. 自动发布

推送 tag 后，GitHub Actions 会自动：

1. **检出代码** - 获取最新代码
2. **安装依赖** - 运行 `npm ci`
3. **构建项目** - 运行 `npm run build`
4. **发布到 npm** - 使用 `NPM_TOKEN` secret
5. **创建 GitHub Release** - 包含 changelog 和打包文件

### 3. 验证发布

```bash
# 检查 npm 上的最新版本
npm view @supertiny99/cc-switch version

# 全局更新到最新版本
npm update -g @supertiny99/cc-switch
```

## 版本号规范

遵循 [Semantic Versioning](https://semver.org/) 规范：

| 类型 | 说明 | 示例 |
|------|------|------|
| **MAJOR** | 破坏性变更 | 删除命令、修改命令行为 |
| **MINOR** | 新功能（向后兼容） | 新增命令、新增选项 |
| **PATCH** | Bug 修复 | 修复错误、优化性能 |

## Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]
```

常用类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具变更

## 配置要求

### GitHub Secrets

需要在 GitHub 仓库设置中配置：

| Secret 名称 | 说明 |
|-------------|------|
| `NPM_TOKEN` | npm access token，用于发布包 |

获取 npm token：
```bash
npm token create
```

然后在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加。

## 故障排除

### 发布失败

1. 检查 GitHub Actions 日志
2. 确认 `NPM_TOKEN` secret 有效且未过期
3. 确认包名未被占用

### 版本冲突

如果版本号已存在于 npm：
```bash
# 查看已发布的版本
npm view @supertiny99/cc-switch versions

# 删除本地 tag 并重新创建
git tag -d v1.2.1
git push origin :refs/tags/v1.2.1
npm version patch  # 创建新版本
```
