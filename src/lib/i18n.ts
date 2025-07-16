import { createComponentLogger } from './logger';
import { eventBus } from './eventBus';

const logger = createComponentLogger('i18n');

// Internationalization Types
interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  autoDetect: boolean;
  enableRTL: boolean;
  enableCurrencyFormat: boolean;
  enableDateFormat: boolean;
}

interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

interface Translations {
  [locale: string]: {
    [namespace: string]: TranslationNamespace;
  };
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  decimals: number;
  position: 'before' | 'after';
}

interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  currency: CurrencyConfig;
  dateFormat: string;
  timeFormat: string;
}

// Internationalization Manager
class I18nManager {
  private static instance: I18nManager;
  private config: I18nConfig;
  private currentLocale: string;
  private translations: Translations = {};
  private localeInfo: Record<string, LocaleInfo> = {};
  private observers: Array<(locale: string) => void> = [];

  private constructor() {
    this.config = {
      defaultLocale: 'en-US',
      supportedLocales: ['en-US', 'ar-AE', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
      fallbackLocale: 'en-US',
      autoDetect: true,
      enableRTL: true,
      enableCurrencyFormat: true,
      enableDateFormat: true
    };

    this.currentLocale = this.config.defaultLocale;
    this.initializeLocales();
    this.loadTranslations();
    this.detectUserLocale();
  }

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  private initializeLocales(): void {
    this.localeInfo = {
      'en-US': {
        code: 'en-US',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
        currency: { code: 'USD', symbol: '$', decimals: 2, position: 'before' },
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h'
      },
      'ar-AE': {
        code: 'ar-AE',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇦🇪',
        direction: 'rtl',
        currency: { code: 'AED', symbol: 'د.إ', decimals: 2, position: 'after' },
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h'
      },
      'es-ES': {
        code: 'es-ES',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        direction: 'ltr',
        currency: { code: 'EUR', symbol: '€', decimals: 2, position: 'after' },
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h'
      },
      'fr-FR': {
        code: 'fr-FR',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        direction: 'ltr',
        currency: { code: 'EUR', symbol: '€', decimals: 2, position: 'after' },
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h'
      },
      'de-DE': {
        code: 'de-DE',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        direction: 'ltr',
        currency: { code: 'EUR', symbol: '€', decimals: 2, position: 'after' },
        dateFormat: 'dd.MM.yyyy',
        timeFormat: '24h'
      },
      'ja-JP': {
        code: 'ja-JP',
        name: 'Japanese',
        nativeName: '日本語',
        flag: '🇯🇵',
        direction: 'ltr',
        currency: { code: 'JPY', symbol: '¥', decimals: 0, position: 'before' },
        dateFormat: 'yyyy/MM/dd',
        timeFormat: '24h'
      },
      'zh-CN': {
        code: 'zh-CN',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳',
        direction: 'ltr',
        currency: { code: 'CNY', symbol: '¥', decimals: 2, position: 'before' },
        dateFormat: 'yyyy/MM/dd',
        timeFormat: '24h'
      }
    };
  }

  private loadTranslations(): void {
    // Load default translations
    this.translations = {
      'en-US': {
        common: {
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          cancel: 'Cancel',
          confirm: 'Confirm',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
          back: 'Back',
          next: 'Next',
          previous: 'Previous',
          search: 'Search',
          filter: 'Filter',
          sort: 'Sort',
          selectAll: 'Select All',
          close: 'Close'
        },
        navigation: {
          home: 'Home',
          properties: 'Properties',
          portfolio: 'Portfolio',
          dashboard: 'Dashboard',
          trading: 'Trading',
          profile: 'Profile',
          settings: 'Settings',
          support: 'Support',
          signIn: 'Sign In',
          signUp: 'Sign Up',
          signOut: 'Sign Out'
        },
        property: {
          title: 'Properties',
          invest: 'Invest',
          details: 'Details',
          location: 'Location',
          price: 'Price',
          expectedReturn: 'Expected Return',
          minimumInvestment: 'Minimum Investment',
          totalShares: 'Total Shares',
          availableShares: 'Available Shares',
          investmentDeadline: 'Investment Deadline',
          propertyType: 'Property Type',
          viewDetails: 'View Details',
          investNow: 'Invest Now'
        },
        investment: {
          title: 'Investment',
          amount: 'Amount',
          shares: 'Shares',
          total: 'Total',
          confirm: 'Confirm Investment',
          success: 'Investment Successful',
          pending: 'Investment Pending',
          failed: 'Investment Failed',
          paymentMethod: 'Payment Method',
          cryptoWallet: 'Crypto Wallet',
          bankTransfer: 'Bank Transfer',
          creditCard: 'Credit Card'
        },
        dashboard: {
          title: 'Dashboard',
          totalInvestment: 'Total Investment',
          totalReturn: 'Total Return',
          activeInvestments: 'Active Investments',
          portfolioValue: 'Portfolio Value',
          recentTransactions: 'Recent Transactions',
          performanceChart: 'Performance',
          recommendations: 'Recommendations'
        },
        auth: {
          signIn: 'Sign In',
          signUp: 'Sign Up',
          email: 'Email',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          firstName: 'First Name',
          lastName: 'Last Name',
          forgotPassword: 'Forgot Password?',
          resetPassword: 'Reset Password',
          createAccount: 'Create Account',
          alreadyHaveAccount: 'Already have an account?',
          dontHaveAccount: "Don't have an account?",
          signInWithGoogle: 'Sign in with Google',
          signInWithWallet: 'Sign in with Wallet'
        }
      },
      'ar-AE': {
        common: {
          loading: 'جارٍ التحميل...',
          error: 'خطأ',
          success: 'نجح',
          cancel: 'إلغاء',
          confirm: 'تأكيد',
          save: 'حفظ',
          delete: 'حذف',
          edit: 'تعديل',
          back: 'رجوع',
          next: 'التالي',
          previous: 'السابق',
          search: 'بحث',
          filter: 'تصفية',
          sort: 'ترتيب',
          selectAll: 'تحديد الكل',
          close: 'إغلاق'
        },
        navigation: {
          home: 'الرئيسية',
          properties: 'العقارات',
          portfolio: 'المحفظة',
          dashboard: 'لوحة التحكم',
          trading: 'التداول',
          profile: 'الملف الشخصي',
          settings: 'الإعدادات',
          support: 'الدعم',
          signIn: 'تسجيل الدخول',
          signUp: 'إنشاء حساب',
          signOut: 'تسجيل الخروج'
        },
        property: {
          title: 'العقارات',
          invest: 'استثمر',
          details: 'التفاصيل',
          location: 'الموقع',
          price: 'السعر',
          expectedReturn: 'العائد المتوقع',
          minimumInvestment: 'الحد الأدنى للاستثمار',
          totalShares: 'إجمالي الأسهم',
          availableShares: 'الأسهم المتاحة',
          investmentDeadline: 'موعد انتهاء الاستثمار',
          propertyType: 'نوع العقار',
          viewDetails: 'عرض التفاصيل',
          investNow: 'استثمر الآن'
        },
        investment: {
          title: 'الاستثمار',
          amount: 'المبلغ',
          shares: 'الأسهم',
          total: 'الإجمالي',
          confirm: 'تأكيد الاستثمار',
          success: 'نجح الاستثمار',
          pending: 'الاستثمار معلق',
          failed: 'فشل الاستثمار',
          paymentMethod: 'طريقة الدفع',
          cryptoWallet: 'محفظة العملات الرقمية',
          bankTransfer: 'تحويل بنكي',
          creditCard: 'بطاقة ائتمان'
        },
        dashboard: {
          title: 'لوحة التحكم',
          totalInvestment: 'إجمالي الاستثمار',
          totalReturn: 'إجمالي العائد',
          activeInvestments: 'الاستثمارات النشطة',
          portfolioValue: 'قيمة المحفظة',
          recentTransactions: 'المعاملات الأخيرة',
          performanceChart: 'الأداء',
          recommendations: 'التوصيات'
        },
        auth: {
          signIn: 'تسجيل الدخول',
          signUp: 'إنشاء حساب',
          email: 'البريد الإلكتروني',
          password: 'كلمة المرور',
          confirmPassword: 'تأكيد كلمة المرور',
          firstName: 'الاسم الأول',
          lastName: 'اسم العائلة',
          forgotPassword: 'نسيت كلمة المرور؟',
          resetPassword: 'إعادة تعيين كلمة المرور',
          createAccount: 'إنشاء حساب',
          alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
          dontHaveAccount: 'ليس لديك حساب؟',
          signInWithGoogle: 'تسجيل الدخول بواسطة Google',
          signInWithWallet: 'تسجيل الدخول بواسطة المحفظة'
        }
      }
    };
  }

  private detectUserLocale(): void {
    if (!this.config.autoDetect) return;

    // Try to get saved locale
    const savedLocale = localStorage.getItem('nexus_locale');
    if (savedLocale && this.config.supportedLocales.includes(savedLocale)) {
      this.setLocale(savedLocale);
      return;
    }

    // Detect from browser
    const browserLocales = navigator.languages || [navigator.language];
    for (const browserLocale of browserLocales) {
      // Try exact match
      if (this.config.supportedLocales.includes(browserLocale)) {
        this.setLocale(browserLocale);
        return;
      }

      // Try language code match
      const languageCode = browserLocale.split('-')[0];
      const matchingLocale = this.config.supportedLocales.find(locale => 
        locale.startsWith(languageCode)
      );
      
      if (matchingLocale) {
        this.setLocale(matchingLocale);
        return;
      }
    }

    // Fallback to default
    this.setLocale(this.config.defaultLocale);
  }

  // Translation Methods
  t(key: string, namespace: string = 'common', interpolations?: Record<string, string | number>): string {
    const keys = key.split('.');
    let translation = this.getTranslation(this.currentLocale, namespace);

    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to default locale
        translation = this.getTranslation(this.config.fallbackLocale, namespace);
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            logger.warn('Translation key not found', { key, namespace, locale: this.currentLocale });
            return key; // Return key as fallback
          }
        }
        break;
      }
    }

    let result = typeof translation === 'string' ? translation : key;

    // Apply interpolations
    if (interpolations) {
      Object.entries(interpolations).forEach(([placeholder, value]) => {
        result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
      });
    }

    return result;
  }

  private getTranslation(locale: string, namespace: string): TranslationNamespace | undefined {
    return this.translations[locale]?.[namespace];
  }

  // Locale Management
  setLocale(locale: string): void {
    if (!this.config.supportedLocales.includes(locale)) {
      logger.warn('Unsupported locale', { locale });
      return;
    }

    const previousLocale = this.currentLocale;
    this.currentLocale = locale;

    // Save to localStorage
    localStorage.setItem('nexus_locale', locale);

    // Update document attributes
    this.updateDocumentLocale();

    // Notify observers
    this.observers.forEach(callback => callback(locale));

    // Emit event
    eventBus.emit('i18n.locale.changed', {
      previous: previousLocale,
      current: locale,
      direction: this.getDirection(),
      currency: this.getCurrency()
    });

    logger.info('Locale changed', { from: previousLocale, to: locale });
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  getSupportedLocales(): LocaleInfo[] {
    return this.config.supportedLocales.map(code => this.localeInfo[code]);
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.localeInfo[this.currentLocale]?.direction || 'ltr';
  }

  isRTL(): boolean {
    return this.getDirection() === 'rtl';
  }

  private updateDocumentLocale(): void {
    const localeInfo = this.localeInfo[this.currentLocale];
    if (!localeInfo) return;

    // Update document attributes
    document.documentElement.lang = this.currentLocale;
    document.documentElement.dir = localeInfo.direction;

    // Update CSS custom properties for RTL support
    if (this.config.enableRTL) {
      document.documentElement.style.setProperty(
        '--text-direction', 
        localeInfo.direction
      );
    }
  }

  // Currency Formatting
  formatCurrency(amount: number, currency?: string): string {
    if (!this.config.enableCurrencyFormat) {
      return amount.toString();
    }

    const localeInfo = this.localeInfo[this.currentLocale];
    const currencyConfig = localeInfo?.currency;
    const currencyCode = currency || currencyConfig?.code || 'USD';

    try {
      const formatter = new Intl.NumberFormat(this.currentLocale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currencyConfig?.decimals || 2,
        maximumFractionDigits: currencyConfig?.decimals || 2
      });

      return formatter.format(amount);
    } catch (error) {
      logger.error('Currency formatting failed', error, { amount, currency });
      return `${currencyConfig?.symbol || '$'}${amount.toFixed(currencyConfig?.decimals || 2)}`;
    }
  }

  getCurrency(): CurrencyConfig {
    return this.localeInfo[this.currentLocale]?.currency || {
      code: 'USD',
      symbol: '$',
      decimals: 2,
      position: 'before'
    };
  }

  // Date and Time Formatting
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    if (!this.config.enableDateFormat) {
      return date.toLocaleDateString();
    }

    try {
      const formatter = new Intl.DateTimeFormat(this.currentLocale, options);
      return formatter.format(date);
    } catch (error) {
      logger.error('Date formatting failed', error, { date });
      return date.toLocaleDateString();
    }
  }

  formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const localeInfo = this.localeInfo[this.currentLocale];
    const is24Hour = localeInfo?.timeFormat === '24h';

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24Hour,
      ...options
    };

    try {
      const formatter = new Intl.DateTimeFormat(this.currentLocale, defaultOptions);
      return formatter.format(date);
    } catch (error) {
      logger.error('Time formatting failed', error, { date });
      return date.toLocaleTimeString();
    }
  }

  formatRelativeTime(date: Date): string {
    try {
      const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });
      const diffInMs = date.getTime() - Date.now();
      const diffInMinutes = Math.round(diffInMs / (1000 * 60));
      const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

      if (Math.abs(diffInMinutes) < 60) {
        return rtf.format(diffInMinutes, 'minute');
      } else if (Math.abs(diffInHours) < 24) {
        return rtf.format(diffInHours, 'hour');
      } else {
        return rtf.format(diffInDays, 'day');
      }
    } catch (error) {
      logger.error('Relative time formatting failed', error, { date });
      return date.toLocaleDateString();
    }
  }

  // Number Formatting
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    try {
      const formatter = new Intl.NumberFormat(this.currentLocale, options);
      return formatter.format(number);
    } catch (error) {
      logger.error('Number formatting failed', error, { number });
      return number.toString();
    }
  }

  formatPercentage(value: number, decimals: number = 1): string {
    try {
      const formatter = new Intl.NumberFormat(this.currentLocale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      return formatter.format(value / 100);
    } catch (error) {
      logger.error('Percentage formatting failed', error, { value });
      return `${value.toFixed(decimals)}%`;
    }
  }

  // Observer Pattern
  subscribe(callback: (locale: string) => void): () => void {
    this.observers.push(callback);
    
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  // Load additional translations
  async loadTranslations(locale: string, namespace: string, translations: TranslationNamespace): Promise<void> {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    
    this.translations[locale][namespace] = translations;
    logger.debug('Translations loaded', { locale, namespace });
  }

  // Translation interpolation helpers
  pluralize(count: number, key: string, namespace: string = 'common'): string {
    const rules = new Intl.PluralRules(this.currentLocale);
    const rule = rules.select(count);
    
    const pluralKey = `${key}.${rule}`;
    const fallbackKey = `${key}.other`;
    
    let translation = this.t(pluralKey, namespace);
    if (translation === pluralKey) {
      translation = this.t(fallbackKey, namespace);
    }
    
    return translation.replace('{{count}}', this.formatNumber(count));
  }
}

// Global i18n instance
export const i18n = I18nManager.getInstance();

// React Hooks
export function useTranslation(namespace: string = 'common') {
  const [currentLocale, setCurrentLocale] = React.useState(i18n.getCurrentLocale());

  React.useEffect(() => {
    const unsubscribe = i18n.subscribe(setCurrentLocale);
    return unsubscribe;
  }, []);

  const t = React.useCallback((key: string, interpolations?: Record<string, string | number>) => {
    return i18n.t(key, namespace, interpolations);
  }, [namespace, currentLocale]);

  return {
    t,
    locale: currentLocale,
    isRTL: i18n.isRTL(),
    direction: i18n.getDirection(),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatTime: i18n.formatTime.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatPercentage: i18n.formatPercentage.bind(i18n),
    pluralize: (count: number, key: string) => i18n.pluralize(count, key, namespace)
  };
}

export function useLocale() {
  const [currentLocale, setCurrentLocale] = React.useState(i18n.getCurrentLocale());
  const [supportedLocales] = React.useState(i18n.getSupportedLocales());

  React.useEffect(() => {
    const unsubscribe = i18n.subscribe(setCurrentLocale);
    return unsubscribe;
  }, []);

  const changeLocale = React.useCallback((locale: string) => {
    i18n.setLocale(locale);
  }, []);

  return {
    currentLocale,
    supportedLocales,
    changeLocale,
    isRTL: i18n.isRTL(),
    direction: i18n.getDirection(),
    currency: i18n.getCurrency()
  };
}

// Higher-order component for translation
export function withTranslation<P extends object>(
  Component: React.ComponentType<P & { t: (key: string, interpolations?: Record<string, string | number>) => string }>,
  namespace: string = 'common'
) {
  return React.forwardRef<any, P>((props, ref) => {
    const { t } = useTranslation(namespace);
    return <Component ref={ref} {...props} t={t} />;
  });
}

// Language Selector Component
export function LanguageSelector({ className }: { className?: string }) {
  const { currentLocale, supportedLocales, changeLocale } = useLocale();
  const { t } = useTranslation();

  return (
    <select
      value={currentLocale}
      onChange={(e) => changeLocale(e.target.value)}
      className={className}
      aria-label={t('selectLanguage')}
    >
      {supportedLocales.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.flag} {locale.nativeName}
        </option>
      ))}
    </select>
  );
}

// RTL Support Component
export function RTLProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = React.useState(i18n.getDirection());

  React.useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      setDirection(i18n.getDirection());
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.style.setProperty('--text-direction', direction);
  }, [direction]);

  return <>{children}</>;
}

export { I18nManager };