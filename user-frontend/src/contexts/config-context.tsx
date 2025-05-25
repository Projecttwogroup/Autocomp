import React, { createContext, useContext } from 'react';

interface Config {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: {
    ai: boolean;
    attachments: boolean;
    notifications: boolean;
  };
  limits: {
    maxFileSize: number;
    maxAttachments: number;
    supportedFileTypes: string[];
  };
}

const defaultConfig: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://localhost:7181',
  environment: (import.meta.env.VITE_ENVIRONMENT || 'development') as Config['environment'],
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  features: {
    ai: true,
    attachments: true,
    notifications: true,
  },
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxAttachments: 5,
    supportedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
    ],
  },
};

const ConfigContext = createContext<Config | null>(null);

interface ConfigProviderProps {
  children: React.ReactNode;
  config?: Partial<Config>;
}

export function ConfigProvider({ children, config = {} }: ConfigProviderProps) {
  const mergedConfig = React.useMemo(
    () => ({
      ...defaultConfig,
      ...config,
      features: {
        ...defaultConfig.features,
        ...config.features,
      },
      limits: {
        ...defaultConfig.limits,
        ...config.limits,
      },
    }),
    [config]
  );

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}