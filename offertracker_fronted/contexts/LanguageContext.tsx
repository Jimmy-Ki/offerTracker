import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 导入语言文件
import zhCN from '../locales/zh-CN.json';

type Locale = 'zh-CN' | 'en-US';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 获取嵌套的翻译值
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || path;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('zh-CN');

  const translations = {
    'zh-CN': zhCN,
    'en-US': {}, // 英文版本可以后续添加
  };

  const t = (key: string): string => {
    return getNestedValue(translations[locale], key);
  };

  // 从localStorage加载语言设置
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['zh-CN', 'en-US'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  // 保存语言设置到localStorage
  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};