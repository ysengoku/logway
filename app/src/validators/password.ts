export type PasswordValidationKey = 'missingPassword' | 'passwordsDoNotMatch' | 'weakPassword';

function isStrongPassword(password: string): boolean {
  const hasMinLength = password.length >= 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  // ASCII punctuation ranges: !-/, :-@, [-`, {-~
  const hasSymbol = /[!-/:-@[-`{-~]/.test(password);

  return hasMinLength && hasLowercase && hasUppercase && hasDigit && hasSymbol;
}

export function validatePassword(
  newPassword: string,
  confirmNewPassword: string,
  passwordRequired = true,
): PasswordValidationKey | null {
  if (passwordRequired && !newPassword && !confirmNewPassword) {
    return 'missingPassword';
  }

  if (!passwordRequired && !newPassword && !confirmNewPassword) {
    return null;
  }

  if ((newPassword && !confirmNewPassword) || (!newPassword && confirmNewPassword)) {
    return 'missingPassword';
  }

  if (newPassword !== confirmNewPassword) {
    return 'passwordsDoNotMatch';
  }

  if (!isStrongPassword(newPassword)) {
    return 'weakPassword';
  }

  return null;
}
