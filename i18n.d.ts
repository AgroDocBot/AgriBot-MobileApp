import 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof import('./translations/locales/en.json');
    };
  }
}
