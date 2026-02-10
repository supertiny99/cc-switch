## 1. 创建新模块 `saver.ts`

- [x] 1.1 创建 `src/lib/config/saver.ts` 文件
- [x] 1.2 定义 `KNOWN_FIELDS` 常量数组（7个已知字段）
- [x] 1.3 实现 `extractKnownFields()` 函数，从 settings.env 提取白名单字段
- [x] 1.4 实现 `maskToken()` 函数，遮罩敏感 token 信息（sk-ant-***...***xyz 格式）
- [x] 1.5 实现 `displayDetectedConfig()` 函数，显示检测到的配置摘要

## 2. 实现智能默认值生成

- [x] 2.1 实现 `generateSmartId()` 函数，基于 provider 类型和 URL 生成 ID
- [x] 2.2 添加 URL 解析逻辑，从域名提取有意义的名称（如 api.example.com → example）
- [x] 2.3 添加 try/catch 处理 URL 解析异常，降级到使用 provider 类型
- [x] 2.4 实现 `generateSmartName()` 函数，基于 provider 预设生成名称
- [x] 2.5 为 anthropic 官方 API 添加时间戳区分（anthropic-{timestamp}）

## 3. 实现相似配置检测

- [x] 3.1 实现 `findSimilarProfiles()` 函数，检测相同 base URL 或 token 前缀
- [x] 3.2 实现 `getSimilarityReason()` 函数，生成相似原因描述
- [x] 3.3 比较 base URL 是否完全匹配
- [x] 3.4 比较 token 前 10 个字符是否匹配
- [x] 3.5 返回相似 profile 列表

## 4. 实现 `cc-switch save` 命令主逻辑

- [x] 4.1 实现 `saveCurrentConfig()` 主函数，处理完整保存流程
- [x] 4.2 读取当前 settings.json 并提取配置
- [x] 4.3 检查当前配置是否已保存（通过 getCurrentProfileId）
- [x] 4.4 若已保存，询问是否创建副本
- [x] 4.5 验证必需字段（ANTHROPIC_AUTH_TOKEN）是否存在
- [x] 4.6 检测 provider 类型并显示配置摘要
- [x] 4.7 调用 `findSimilarProfiles()` 检测并警告相似配置
- [x] 4.8 生成智能默认值并提示用户输入 ID/name/description/icon
- [x] 4.9 在 prompts 的 validate 函数中检查 ID 冲突
- [x] 4.10 创建 ProviderProfile 对象并调用 `saveProfile()` 保存
- [x] 4.11 显示成功消息

## 5. 实现快速保存模式

- [x] 5.1 实现 `quickSaveCurrentConfig()` 函数，用于 auto-save 场景
- [x] 5.2 只提示输入 ID 和 name，跳过 description 和 icon
- [x] 5.3 使用检测到的 preset icon 作为默认值
- [x] 5.4 添加错误处理，捕获 ID 冲突异常
- [x] 5.5 保存成功后显示简洁的成功消息

## 6. 在 `src/index.ts` 中添加 `save` 命令

- [x] 6.1 导入 `saver.ts` 中的 `saveCurrentConfig` 函数
- [x] 6.2 添加 `program.command('save')` 命令定义
- [x] 6.3 设置命令描述为 "Save current config as a new profile"
- [x] 6.4 在 action 中调用 `saveCurrentConfig()`
- [x] 6.5 添加错误处理（try/catch），显示友好错误消息

## 7. 修改 `cc-switch use` 命令添加 auto-save 提示

- [x] 7.1 在 `use` 命令 action 开始处添加 auto-save 检测逻辑
- [x] 7.2 调用 `getCurrentProfileId()` 检查当前配置是否为 unknown
- [x] 7.3 若为 unknown，显示警告 "Current configuration is not saved"
- [x] 7.4 使用 prompts 询问 "Save current config before switching? (Y/n)"
- [x] 7.5 若用户选择 Yes，调用 `quickSaveCurrentConfig()` 快速保存
- [x] 7.6 处理用户取消（Ctrl+C）情况，终止整个 use 命令
- [x] 7.7 保存成功后继续执行原有的 use 命令逻辑

## 8. 测试与验证

- [x] 8.1 测试 `cc-switch save` 保存当前配置（手动修改 settings.json 后）
- [x] 8.2 测试已保存配置时的副本创建提示
- [x] 8.3 测试缺少 ANTHROPIC_AUTH_TOKEN 时的错误提示
- [x] 8.4 测试智能 ID 生成（custom provider 从 URL 提取）
- [x] 8.5 测试相似配置检测（相同 base URL 和 token 前缀）
- [x] 8.6 测试 token 遮罩显示（前7后4格式）
- [x] 8.7 测试 ID 冲突时的 validate 错误提示（代码审查验证）
- [x] 8.8 测试 `cc-switch use` 时的 auto-save 提示（unknown 配置）（代码审查验证）
- [x] 8.9 测试快速保存模式（只要求 ID/name）（代码审查验证）
- [x] 8.10 测试已保存配置时 use 命令行为不变（无额外提示）（代码审查验证）
- [x] 8.11 测试 URL 解析异常时的降级处理（代码审查验证）

## 9. 文档与发布

- [x] 9.1 更新 README.md，添加 `cc-switch save` 命令说明
- [x] 9.2 更新 CLAUDE.md，添加新模块 saver.ts 的架构说明
- [x] 9.3 在 README 中说明 auto-save 提示功能
- [x] 9.4 添加使用示例（外部工具修改配置后保存）
- [ ] 9.5 运行 `npm run build` 编译 TypeScript
- [ ] 9.6 运行 `npm run link:global` 本地测试
- [ ] 9.7 版本号升级到 1.1.0 (minor release)
- [ ] 9.8 运行 `npm run release:minor` 发布到 npm
