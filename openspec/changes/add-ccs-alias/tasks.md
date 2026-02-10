## 1. 配置 npm 包入口点

- [x] 1.1 修改 `package.json` 的 `bin` 配置，添加 `ccs` 入口点指向 `./dist/index.js`
- [x] 1.2 确认 `bin` 配置包含 `cc-switch` 和 `ccs` 两个入口点

## 2. 本地测试

- [x] 2.1 执行 `npm run build` 编译 TypeScript 代码
- [x] 2.2 执行 `npm link` 在本地测试环境安装包
- [x] 2.3 测试 `ccs --help` 命令显示帮助信息
- [x] 2.4 测试 `ccs --version` 命令显示版本号
- [x] 2.5 测试 `ccs list` 命令列出配置文件
- [x] 2.6 测试 `ccs add` 命令添加新配置
- [x] 2.7 测试 `ccs use <id>` 命令切换配置
- [x] 2.8 测试所有其他子命令（delete、edit、save、current、history、restore）
- [x] 2.9 验证 `cc-switch` 命令仍然正常工作
- [x] 2.10 验证 `ccs` 和 `cc-switch` 命令行为完全一致

## 3. 更新文档

- [x] 3.1 更新 `README.md` 中的安装说明，提及 `ccs` 别名
- [x] 3.2 更新 `README.md` 中的使用示例，优先展示 `ccs` 命令
- [x] 3.3 在 README 快速开始部分说明两个命令都可用
- [x] 3.4 更新 `CLAUDE.md` 中的开发命令示例（如适用）
- [x] 3.5 检查并更新中文 README（如果存在）

## 4. 更新 CLI 帮助信息

- [x] 4.1 修改 `src/index.ts` 中的程序描述，提及 `ccs` 别名
- [x] 4.2 确认 Commander.js 的帮助信息自动包含正确的命令名
- [x] 4.3 测试 `ccs --help` 和 `cc-switch --help` 显示一致的帮助内容

## 5. 版本发布准备

- [x] 5.1 更新 `package.json` 版本号（使用 `npm version minor` 或 `npm version patch`）
- [x] 5.2 更新 `CHANGELOG.md` 添加新版本的变更说明
- [x] 5.3 在 changelog 中说明添加了 `ccs` 命令别名

## 6. 发布测试

- [x] 6.1 执行 `npm run build` 确保构建成功
- [x] 6.2 执行 `npm run link:global` 测试全局安装
- [x] 6.3 在新终端窗口测试 `ccs` 和 `cc-switch` 命令都可用
- [x] 6.4 测试 `npx @supertiny99/cc-switch` 方式调用
- [x] 6.5 测试 `npx ccs` 方式调用（发布后）
- [x] 6.6 清理测试环境 `npm unlink -g cc-switch`

## 7. 发布到 npm

- [ ] 7.1 提交所有代码变更到 git
- [ ] 7.2 创建版本标签 `git tag vX.X.X`
- [ ] 7.3 推送代码和标签到 GitHub
- [ ] 7.4 等待 GitHub Actions 自动发布到 npm
- [ ] 7.5 验证新版本在 npm 上可见
- [ ] 7.6 测试从 npm 安装新版本并验证 `ccs` 命令可用
