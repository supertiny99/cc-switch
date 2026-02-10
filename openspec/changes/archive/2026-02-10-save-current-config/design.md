## Context

cc-switch 当前通过 `~/.claude/profiles/*.json` 管理 provider 配置，并通过 `applyProfile()` 将 profile 应用到 `~/.claude/settings.json`。但当外部工具直接修改 settings.json 时，这些配置变更不会自动保存为 profile，导致用户切换 provider 时可能丢失外部工具的配置。

**当前架构**:
- `src/lib/config/loader.ts`: 读取 settings 和 profiles
- `src/lib/config/writer.ts`: 应用 profile、备份、恢复
- `src/lib/config/creator.ts`: 创建新 profile（基于预设模板）
- `src/index.ts`: CLI 命令定义

**约束条件**:
- 只捕获已知的 ANTHROPIC_* 字段，避免引入不相关配置
- 保持现有 profile 结构不变
- 保持向后兼容，不影响现有功能

## Goals / Non-Goals

**Goals:**
- 提供 `cc-switch save` 命令，快速保存当前配置为 profile
- 在 `cc-switch use` 切换前，检测 unknown 配置并提示保存
- 智能生成合理的默认 ID/name，减少用户输入
- 检测相似配置并警告，避免重复
- 半自动交互：自动填充默认值，允许自定义

**Non-Goals:**
- 不自动同步所有配置变更到 profiles（仅在用户主动保存时）
- 不修改现有 profile 的结构或存储方式
- 不支持批量导入或导出 profiles（超出当前范围）

## Decisions

### Decision 1: 新增独立模块 `saver.ts`

**选择**: 在 `src/lib/config/saver.ts` 中实现所有保存相关逻辑

**理由**:
- 职责分离：`creator.ts` 负责基于预设创建，`saver.ts` 负责从现有配置保存
- 避免 `creator.ts` 膨胀，保持模块单一职责
- 便于测试和维护

**替代方案**:
- 将逻辑放入 `creator.ts`：会导致职责混淆，因为"从预设创建"和"从当前配置保存"是不同的场景

### Decision 2: 字段捕获策略 - 白名单模式

**选择**: 只捕获以下已知字段
```typescript
const KNOWN_FIELDS = [
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
  'API_TIMEOUT_MS',
  'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC'
];
```

**理由**:
- 安全：避免捕获未知或不相关的环境变量
- 干净：保持 profile 结构简洁
- 可控：明确知道保存了哪些字段

**替代方案**:
- 捕获所有 `ANTHROPIC_*` 字段：可能引入不相关配置，增加维护负担

### Decision 3: 相似配置检测逻辑

**选择**: 基于以下规则检测相似配置
- 相同 `ANTHROPIC_BASE_URL`
- 相同 token 前缀（前 10 个字符）

**理由**:
- Base URL 相同通常表示同一个 provider
- Token 前缀相同可能是同一账户的不同 token
- 警告但允许创建副本，给用户完全控制权

**替代方案**:
- 完全阻止重复：过于严格，用户可能确实需要相同 base URL 的不同配置（如不同 model 配置）

### Decision 4: 智能 ID 生成策略

**选择**: 根据 provider 类型和 base URL 生成
```typescript
function generateSmartId(providerType: string, config: Record<string, string>): string {
  if (providerType === 'custom' && config.ANTHROPIC_BASE_URL) {
    // 从 URL 提取域名: https://api.example.com → example
    const hostname = new URL(config.ANTHROPIC_BASE_URL).hostname;
    const domain = hostname.replace('api.', '').replace('.com', '');
    return sanitizeId(domain);
  }

  // 已知 provider 类型: anthropic, zhipu-coding, openrouter 等
  return providerType === 'anthropic'
    ? 'anthropic-' + Date.now()
    : providerType;
}
```

**理由**:
- Custom provider 从 URL 提取有意义的名称
- 已知 provider 使用 provider 类型作为基础
- Anthropic 官方 API 可能有多个账户，加时间戳区分

**替代方案**:
- 总是使用时间戳：不够友好，ID 难以识别

### Decision 5: Auto-save 提示时机

**选择**: 在 `cc-switch use` 命令开始时检测

```typescript
// 在 use 命令最开始执行
const currentProfileId = getCurrentProfileId(settings);
if (!currentProfileId) {
  // 提示保存
  const { saveFirst } = await prompts({ ... });
  if (saveFirst) {
    await quickSaveCurrentConfig(settings);
  }
}
// 继续执行原有 use 逻辑
```

**理由**:
- 在切换前提示，用户有机会保存
- 不强制保存，用户可选择跳过
- 使用快速保存模式（只要求 ID/name），减少打断

**替代方案**:
- 切换后提示：太晚了，配置已被覆盖
- 切换时自动保存：过于激进，用户可能不希望保存临时配置

### Decision 6: Token 敏感信息显示

**选择**: 部分遮罩显示
```typescript
function maskToken(token: string): string {
  if (token.length <= 10) return '***';
  return `${token.substring(0, 7)}...${token.substring(token.length - 4)}`;
}
// 输出: sk-ant-***...***xyz
```

**理由**:
- 安全：不完全暴露 token
- 可识别：显示前后缀帮助用户识别是哪个 token

**替代方案**:
- 完全隐藏：用户无法识别是哪个 token
- 完全显示：安全风险

## Risks / Trade-offs

### Risk 1: URL 解析失败

**风险**: 当 `ANTHROPIC_BASE_URL` 格式异常时，`new URL()` 可能抛出异常

**缓解措施**:
```typescript
try {
  const hostname = new URL(baseUrl).hostname;
  // ...
} catch (e) {
  // 降级到使用 provider 类型
  return sanitizeId(providerType);
}
```

### Risk 2: 用户输入的 ID 与已有 profile 冲突

**风险**: 用户可能输入一个已存在的 profile ID

**缓解措施**: 在 prompts 的 validate 函数中检查
```typescript
validate: async (val) => {
  const sanitized = sanitizeId(val);
  if (await profileExists(sanitized)) {
    return `Profile "${sanitized}" already exists`;
  }
  return true;
}
```

### Risk 3: 快速保存模式可能覆盖已有 profile

**风险**: quickSaveCurrentConfig 使用默认 ID，可能与已有 profile 重名

**缓解措施**: 在 `saveProfile()` 中已有检查，会抛出异常。捕获后提示用户手动输入新 ID

### Trade-off 1: 半自动 vs 全自动

**选择**: 半自动交互

**权衡**:
- ✓ 给用户控制权，可自定义 ID/name/icon
- ✗ 需要额外交互步骤

**原因**: 配置是长期使用的，值得花 10 秒设置一个好名字

### Trade-off 2: 白名单字段 vs 全量捕获

**选择**: 白名单模式

**权衡**:
- ✓ 安全、干净
- ✗ 可能遗漏某些用户自定义的 ANTHROPIC_* 字段

**原因**: 目前已知字段已覆盖 99% 使用场景，未来可扩展白名单
