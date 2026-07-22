import id from './id.json';
import en from './en.json';

const LOCALES = { id, en };
let currentLocale = 'id';
let currentMessages = LOCALES.id;
let onChangeCallback = null;

export function t(key, params = {}) {
  const keys = key.split('.');
  let value = currentMessages;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (_, name) => {
    return params[name] !== undefined ? String(params[name]) : `{${name}}`;
  });
}

export function setLocale(locale) {
  if (!LOCALES[locale]) return;
  currentLocale = locale;
  currentMessages = LOCALES[locale];
  document.documentElement.lang = locale === 'id' ? 'id' : 'en';
  document.documentElement.dir = 'ltr';
  try { localStorage.setItem('ux-locale', locale); } catch {}
  if (onChangeCallback) onChangeCallback(locale);
}

export function getLocale() {
  return currentLocale;
}

export function getAvailableLocales() {
  return Object.keys(LOCALES);
}

export function initLocale() {
  let saved;
  try { saved = localStorage.getItem('ux-locale'); } catch {}
  setLocale(saved || 'id');
}

export function formatDate(date, options = {}) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const locale = currentLocale === 'id' ? 'id-ID' : 'en-US';
  return d.toLocaleDateString(locale, options);
}

export function formatTime(date, options = {}) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const locale = currentLocale === 'id' ? 'id-ID' : 'en-US';
  return d.toLocaleTimeString(locale, options);
}

export function formatDateTime(date, options = {}) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const locale = currentLocale === 'id' ? 'id-ID' : 'en-US';
  return d.toLocaleString(locale, options);
}

export function formatCurrency(amount, currency = 'IDR') {
  const locale = currentLocale === 'id' ? 'id-ID' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

export function formatNumber(number, options = {}) {
  const locale = currentLocale === 'id' ? 'id-ID' : 'en-US';
  return new Intl.NumberFormat(locale, options).format(number);
}

export function pluralize(count, { one, other, zero }) {
  if (count === 0 && zero) return zero;
  return count === 1 ? one : other.replace('{count}', String(count));
}

export function onLocaleChange(callback) {
  onChangeCallback = callback;
  return () => { onChangeCallback = null; };
}
