export const FREE_BILLING_PROMO_CODE = 'UNITED100';

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

export function isFreeBillingPromoCode(code: string) {
  return normalizePromoCode(code) === FREE_BILLING_PROMO_CODE;
}
