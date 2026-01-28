# 发布指南

## 使用 GitHub Actions 自动发布

### 首次设置

#### 1. 在 GitHub 配置 npm Token

1. 打开你的 GitHub 仓库：`https://github.com/supertiny99/cc-switch`

2. 进入 **Settings** → **Secrets and variables** → **Actions**

3. 点击 **New repository secret**，添加以下内容：
   - **Name**: `NPM_TOKEN`
   - **Value**: 你的 npm token (在 npmjs.com 创建)

4. 点击 **Add secret** 保存

#### 2. 初始化 Git 仓库（如果还没有）

```bash
cd /Users/supertiny/gitprojects/cc-switch

# 初始化 git
git init

# 添加远程仓库
git remote add origin https://github.com/supertiny99/cc-switch.git

# 添加所有文件
git add .

# 首次提交
git commit -m "Initial commit: cc-switch v1.0.0"

# 推送到 GitHub
git push -u origin main
```

### 发布新版本

#### 方式一：使用 npm version（推荐）

```bash
# 1. 更新版本号（自动打 tag）
npm version patch  # 1.0.0 -> 1.0.1 (修复 bug)
npm version minor  # 1.0.0 -> 1.1.0 (新功能)
npm version major  # 1.0.0 -> 2.0.0 (破坏性变更)

# 2. 推送 tag 到 GitHub（触发自动发布）
git push origin main
git push origin v1.0.1  # 推送 tag
```

#### 方式二：手动创建 tag

```bash
# 1. 修改 package.json 中的版本号
# 2. 提交更改
git add package.json
git commit -m "Bump version to 1.0.1"

# 3. 创建并推送 tag
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

### 自动发布流程

当你推送 tag 到 GitHub 后，GitHub Actions 会自动执行以下操作：

1. ✅ 检出代码
2. ✅ 设置 Node.js 环境
3. ✅ 安装依赖
4. ✅ 构建项目
5. ✅ 发布到 npm（公开包）
6. ✅ 创建 GitHub Release

你可以在 GitHub 仓库的 **Actions** 标签页查看发布进度。

### 验证发布

```bash
# 查看 npm 上的包信息
npm view cc-switch

# 或访问
# https://www.npmjs.com/package/cc-switch

# 测试全局安装
npm install -g cc-switch
cc-switch --version
```

### 发布检查清单

- [ ] 修改了 `package.json` 中的版本号
- [ ] 运行 `npm run build` 确保构建成功
- [ ] 更新了 `README.md` 中的变更说明
- [ ] GitHub Secret `NPM_TOKEN` 已配置
- [ ] 推送 tag 格式为 `v*.*.*`（如 v1.0.1）

## 手动发布（本地）

如果 GitHub Actions 不可用，可以手动发布：

```bash
# 1. 构建
npm run build

# 2. 登录 npm（如果未登录）
npm login
# Username: supertiny99
# Password: (使用你的 npm token)

# 3. 发布
npm publish --access public
```

## 本地测试

在发布前，可以先本地测试：

```bash
# 1. 构建
npm run build

# 2. 链接到全局
npm link

# 3. 测试命令
cc-switch --version
cc-switch list
cc-switch current

# 4. 取消链接（测试完成后）
npm unlink -g cc-switch
```

## 版本号规则

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

| 命令 | 版本变化 | 说明 |
|------|----------|------|
| `npm version patch` | 1.0.0 → 1.0.1 | 修复 bug，向后兼容 |
| `npm version minor` | 1.0.0 → 1.1.0 | 新增功能，向后兼容 |
| `npm version major` | 1.0.0 → 2.0.0 | 破坏性变更 |

## 常见问题

### Q: GitHub Actions 发布失败怎么办？

A: 检查以下内容：
1. GitHub Secret `NPM_TOKEN` 是否正确配置
2. Tag 格式是否正确（必须是 `v` 开头，如 `v1.0.0`）
3. 查看 Actions 日志获取具体错误信息

### Q: 如何撤销已发布的版本？

A: npm 不允许删除已发布的版本，只能发布新版本修复问题。

### Q: 如何发布 beta 版本？

A: 使用 prerelease 标记：
```bash
npm version prerelease  # 1.0.0 -> 1.0.1-0
# 或指定 tag
npm publish --tag beta
```

### Q: npm token 失效了怎么办？

A:
1. 在 npmjs.com 创建新的 token
2. 更新 GitHub Secret 中的 `NPM_TOKEN`
