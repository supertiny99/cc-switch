import prompts from 'prompts';
import chalk from 'chalk';
import { Settings, ProviderProfile } from './schema';
import { loadSettings, listProfiles, getCurrentProvider, getCurrentProfileId } from './loader';
import { saveProfile as saveProfileToFile, profileExists } from './creator';
import { PROVIDER_PRESETS } from './creator';
import { sanitizeId } from './creator';

// 任务 1.2: 定义已知字段白名单
const KNOWN_FIELDS = [
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
  'API_TIMEOUT_MS',
  'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC'
];

// 任务 1.3: 提取已知字段
export function extractKnownFields(env: Record<string, string> | undefined): Record<string, string> {
  const result: Record<string, string> = {};

  if (!env) return result;

  for (const key of KNOWN_FIELDS) {
    if (env[key]) {
      result[key] = env[key];
    }
  }

  return result;
}

// 任务 1.4: 遮罩 token 显示
export function maskToken(token: string): string {
  if (token.length <= 10) return '***';
  return `${token.substring(0, 7)}...${token.substring(token.length - 4)}`;
}

// 任务 1.5: 显示检测到的配置
export function displayDetectedConfig(config: Record<string, string>, providerType: string | null): void {
  const preset = PROVIDER_PRESETS.find(p => p.id === providerType);

  console.log(chalk.bold('\n📦 Current Configuration Detected\n'));
  console.log(chalk.gray(`Provider: ${preset?.name || 'Unknown'}`));

  if (config.ANTHROPIC_BASE_URL) {
    console.log(chalk.gray(`Base URL: ${config.ANTHROPIC_BASE_URL}`));
  }

  if (config.ANTHROPIC_DEFAULT_HAIKU_MODEL) {
    console.log(chalk.gray(`Haiku:    ${config.ANTHROPIC_DEFAULT_HAIKU_MODEL}`));
  }

  if (config.ANTHROPIC_DEFAULT_SONNET_MODEL) {
    console.log(chalk.gray(`Sonnet:   ${config.ANTHROPIC_DEFAULT_SONNET_MODEL}`));
  }

  if (config.ANTHROPIC_DEFAULT_OPUS_MODEL) {
    console.log(chalk.gray(`Opus:     ${config.ANTHROPIC_DEFAULT_OPUS_MODEL}`));
  }

  if (config.ANTHROPIC_AUTH_TOKEN) {
    console.log(chalk.gray(`Token:    ${maskToken(config.ANTHROPIC_AUTH_TOKEN)}`));
  }

  console.log('');
}

// 任务 2.1-2.5: 智能默认值生成
export function generateSmartId(providerType: string | null, config: Record<string, string>): string {
  // 任务 2.2: 从 URL 提取域名
  if (providerType === 'custom' && config.ANTHROPIC_BASE_URL) {
    try {
      const hostname = new URL(config.ANTHROPIC_BASE_URL).hostname;
      const domain = hostname.replace('api.', '').replace('.com', '');
      return sanitizeId(domain);
    } catch (e) {
      // 任务 2.3: URL 解析失败降级处理
      return sanitizeId(providerType || 'custom');
    }
  }

  // 任务 2.5: anthropic 官方 API 添加时间戳
  return providerType === 'anthropic'
    ? 'anthropic-' + Date.now()
    : sanitizeId(providerType || 'custom');
}

// 任务 2.4: 生成智能名称
export function generateSmartName(providerType: string | null): string {
  const preset = PROVIDER_PRESETS.find(p => p.id === providerType);
  return preset?.name || 'Custom Provider';
}

// 任务 3.1-3.5: 相似配置检测
export async function findSimilarProfiles(config: Record<string, string>): Promise<ProviderProfile[]> {
  const profiles = await listProfiles();
  const similar: ProviderProfile[] = [];

  for (const profile of profiles) {
    // 任务 3.3: 比较 base URL
    if (profile.config.env.ANTHROPIC_BASE_URL &&
        profile.config.env.ANTHROPIC_BASE_URL === config.ANTHROPIC_BASE_URL) {
      similar.push(profile);
      continue;
    }

    // 任务 3.4: 比较 token 前 10 个字符
    if (profile.config.env.ANTHROPIC_AUTH_TOKEN &&
        config.ANTHROPIC_AUTH_TOKEN &&
        profile.config.env.ANTHROPIC_AUTH_TOKEN.substring(0, 10) ===
        config.ANTHROPIC_AUTH_TOKEN.substring(0, 10)) {
      similar.push(profile);
    }
  }

  // 任务 3.5: 返回相似 profile 列表
  return similar;
}

// 任务 3.2: 生成相似原因描述
export function getSimilarityReason(profile: ProviderProfile, config: Record<string, string>): string {
  if (profile.config.env.ANTHROPIC_BASE_URL === config.ANTHROPIC_BASE_URL) {
    return 'same base URL';
  }
  if (profile.config.env.ANTHROPIC_AUTH_TOKEN?.substring(0, 10) ===
      config.ANTHROPIC_AUTH_TOKEN?.substring(0, 10)) {
    return 'same token prefix';
  }
  return 'similar configuration';
}

// 任务 4.1-4.11: 主保存函数
export async function saveCurrentConfig(): Promise<void> {
  // 任务 4.2: 读取当前 settings.json 并提取配置
  const settings = await loadSettings();
  const extractedConfig = extractKnownFields(settings.env);

  // 任务 4.5: 验证必需字段
  if (!extractedConfig.ANTHROPIC_AUTH_TOKEN) {
    console.log(chalk.red('✗ Missing required field: ANTHROPIC_AUTH_TOKEN'));
    console.log(chalk.yellow('  Current settings do not contain a valid token'));
    return;
  }

  // 任务 4.3: 检查当前配置是否已保存
  const currentProfileId = getCurrentProfileId(settings);
  if (currentProfileId) {
    const profiles = await listProfiles();
    const currentProfile = profiles.find(p => p.id === currentProfileId);

    if (currentProfile) {
      console.log(chalk.yellow(`\n⚠️  Current config is already saved as "${currentProfile.icon} ${currentProfile.name}"`));

      // 任务 4.4: 询问是否创建副本
      const { createCopy } = await prompts({
        type: 'confirm',
        name: 'createCopy',
        message: 'Create a copy anyway?',
        initial: false
      });

      if (!createCopy) {
        console.log(chalk.yellow('Cancelled'));
        return;
      }
    }
  }

  // 任务 4.6: 检测 provider 类型并显示配置摘要
  const providerType = getCurrentProvider(settings);
  displayDetectedConfig(extractedConfig, providerType);

  // 任务 4.7: 检测并警告相似配置
  const similarProfiles = await findSimilarProfiles(extractedConfig);
  if (similarProfiles.length > 0) {
    console.log(chalk.yellow('\n⚠️  Similar configurations found:'));
    similarProfiles.forEach(p => {
      console.log(`  • "${p.name}" - ${getSimilarityReason(p, extractedConfig)}`);
    });

    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: 'Create new profile anyway?',
      initial: true
    });

    if (!proceed) {
      console.log(chalk.yellow('Cancelled'));
      return;
    }
  }

  // 任务 4.8: 生成智能默认值并提示用户输入
  const suggestedId = generateSmartId(providerType, extractedConfig);
  const suggestedName = generateSmartName(providerType);
  const preset = PROVIDER_PRESETS.find(p => p.id === providerType);

  const answers = await prompts([
    {
      type: 'text',
      name: 'id',
      message: 'Profile ID:',
      initial: suggestedId,
      // 任务 4.9: 在 validate 中检查 ID 冲突
      validate: async (val: string) => {
        if (!val.trim()) return 'ID is required';
        const sanitized = sanitizeId(val);
        if (await profileExists(sanitized)) {
          return `Profile "${sanitized}" already exists`;
        }
        return true;
      }
    },
    {
      type: 'text',
      name: 'name',
      message: 'Profile name:',
      initial: suggestedName,
      validate: (val: string) => val.trim().length > 0 || 'Name is required'
    },
    {
      type: 'text',
      name: 'description',
      message: 'Description (optional):'
    },
    {
      type: 'text',
      name: 'icon',
      message: 'Icon:',
      initial: preset?.icon || '📦'
    }
  ]);

  if (!answers.id || !answers.name) {
    console.log(chalk.yellow('Cancelled'));
    return;
  }

  // 任务 4.10: 创建 ProviderProfile 对象并保存
  const profile: ProviderProfile = {
    id: sanitizeId(answers.id),
    name: answers.name,
    description: answers.description || undefined,
    icon: answers.icon,
    config: {
      env: {
        ANTHROPIC_AUTH_TOKEN: extractedConfig.ANTHROPIC_AUTH_TOKEN,
        ...extractedConfig
      }
    }
  };

  await saveProfileToFile(profile);

  // 任务 4.11: 显示成功消息
  console.log(chalk.green(`\n✓ Saved as "${profile.name}" (${profile.id})`));
}

// 任务 5.1-5.5: 快速保存模式
export async function quickSaveCurrentConfig(settings: Settings): Promise<void> {
  const extractedConfig = extractKnownFields(settings.env);

  if (!extractedConfig.ANTHROPIC_AUTH_TOKEN) {
    console.log(chalk.red('✗ Missing required field: ANTHROPIC_AUTH_TOKEN'));
    return;
  }

  const providerType = getCurrentProvider(settings);
  const suggestedId = generateSmartId(providerType, extractedConfig);
  const suggestedName = generateSmartName(providerType);
  const preset = PROVIDER_PRESETS.find(p => p.id === providerType);

  // 任务 5.2: 只提示输入 ID 和 name
  const answers = await prompts([
    {
      type: 'text',
      name: 'id',
      message: 'Profile ID:',
      initial: suggestedId,
      validate: async (val: string) => {
        if (!val.trim()) return 'ID is required';
        const sanitized = sanitizeId(val);
        if (await profileExists(sanitized)) {
          return `Profile "${sanitized}" already exists`;
        }
        return true;
      }
    },
    {
      type: 'text',
      name: 'name',
      message: 'Profile name:',
      initial: suggestedName,
      validate: (val: string) => val.trim().length > 0 || 'Name is required'
    }
  ]);

  if (!answers.id || !answers.name) {
    throw new Error('User cancelled');
  }

  // 任务 5.3: 使用检测到的 preset icon
  const profile: ProviderProfile = {
    id: sanitizeId(answers.id),
    name: answers.name,
    icon: preset?.icon || '📦',
    config: {
      env: {
        ANTHROPIC_AUTH_TOKEN: extractedConfig.ANTHROPIC_AUTH_TOKEN,
        ...extractedConfig
      }
    }
  };

  try {
    await saveProfileToFile(profile);
    // 任务 5.5: 显示简洁的成功消息
    console.log(chalk.green(`✓ Saved as "${profile.name}"\n`));
  } catch (err: any) {
    // 任务 5.4: 捕获 ID 冲突异常
    if (err.message.includes('already exists')) {
      console.log(chalk.red(`✗ Profile "${profile.id}" already exists`));
      throw new Error('Profile ID conflict');
    }
    throw err;
  }
}
