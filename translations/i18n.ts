import { I18n } from 'i18n-js';
import en from './locales/en.json';
//import de from './locales/de.json';
import bg from './locales/bg.json';

const i18n = new I18n({
  en: en,
  bg: bg,
  //de: de,
});

export default i18n;
