// next-intl locales are lowercase URL segments ("nl", "en"); the API's
// Locale enum is uppercase ("NL", "EN"). Every API call that takes a locale
// must convert at the boundary.
export function toApiLocale(locale: string): string {
  return locale.toUpperCase();
}
