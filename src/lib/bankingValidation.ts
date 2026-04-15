/**
 * ABA routing number checksum validation.
 * The ABA standard defines that a valid 9-digit routing number must satisfy:
 *   3*(d1+d4+d7) + 7*(d2+d5+d8) + 1*(d3+d6+d9) ≡ 0 (mod 10)
 */
export function validateRoutingNumber(routing: string): {
  valid: boolean;
  message: string;
} {
  if (!routing) return { valid: false, message: '' };
  if (!/^\d+$/.test(routing)) return { valid: false, message: 'Only digits allowed' };
  if (routing.length < 9) return { valid: false, message: `${9 - routing.length} more digit${9 - routing.length === 1 ? '' : 's'} needed` };
  if (routing.length > 9) return { valid: false, message: 'Must be exactly 9 digits' };

  const d = routing.split('').map(Number);
  const checksum =
    3 * (d[0] + d[3] + d[6]) +
    7 * (d[1] + d[4] + d[7]) +
    1 * (d[2] + d[5] + d[8]);

  if (checksum % 10 !== 0) {
    return { valid: false, message: 'Invalid routing number — please double-check' };
  }
  return { valid: true, message: 'Valid routing number ✓' };
}

/**
 * Basic account number validation.
 * US bank account numbers are 4–17 digits.
 */
export function validateAccountNumber(account: string): {
  valid: boolean;
  message: string;
} {
  if (!account) return { valid: false, message: '' };
  if (!/^\d+$/.test(account)) return { valid: false, message: 'Only digits allowed' };
  if (account.length < 4) return { valid: false, message: `${4 - account.length} more digit${4 - account.length === 1 ? '' : 's'} needed` };
  if (account.length > 17) return { valid: false, message: 'Account numbers are at most 17 digits' };
  return { valid: true, message: `Valid · ends in ${account.slice(-4)}` };
}

/**
 * Account number confirmation match check.
 */
export function validateAccountConfirm(account: string, confirm: string): {
  valid: boolean;
  message: string;
} {
  if (!confirm) return { valid: false, message: '' };
  if (confirm === account) return { valid: true, message: 'Account numbers match ✓' };
  return { valid: false, message: 'Account numbers do not match' };
}
