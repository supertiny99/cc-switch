export interface ProviderProfile {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  config: {
    env: {
      ANTHROPIC_AUTH_TOKEN: string;
      ANTHROPIC_BASE_URL?: string;
      ANTHROPIC_DEFAULT_HAIKU_MODEL?: string;
      ANTHROPIC_DEFAULT_OPUS_MODEL?: string;
      ANTHROPIC_DEFAULT_SONNET_MODEL?: string;
      API_TIMEOUT_MS?: string;
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC?: string;
      [key: string]: string | undefined;
    };
  };
}

export interface Settings {
  env?: Record<string, string>;
  enabledPlugins?: Record<string, boolean>;
  permissions?: { allow?: string[] };
  statusLine?: { type?: string; command?: string };
  teammateMode?: string;
  [key: string]: any;
}
