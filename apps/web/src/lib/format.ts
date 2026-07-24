export function formatPrice(amount: number, locale = "nl-BE"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(amount);
}
