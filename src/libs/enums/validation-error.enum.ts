export enum ValidationError {
  WRONG_EMAIL_FORMAT = 'wrong-email-format',
  WRONG_IMAGE_FORMAT = 'user-photo-must-be-base64',
  WRONG_MFA_CODE_FORMAT = 'mfa-code-should-be-6-digit-code',
  WRONG_PHONE_CODE_FORMAT = 'phone-code-should-be-6-digit-code',
  WRONG_PASSWORD_FORMAT = 'wrong-password-format',
  WRONG_TWO_FA_TOKEN_FORMAT = 'wrong-two-fa-token-format',
  WRONG_TWO_FA_TOKEN_LENGTH = 'wrong-two-fa-token-length',
  WRONG_FIRST_NAME_FORMAT = 'wrong-first-name-format',
  WRONG_FIRST_NAME_LENGTH = 'wrong-first-name-length',
  WRONG_LAST_NAME_FORMAT = 'wrong-last-name-format',
  WRONG_LAST_NAME_LENGTH = 'wrong-last-name-length',
  WRONG_PASSPHRASE_FORMAT = 'wrong-passphrase-format',
  WRONG_PASSPHRASE_LENGTH = 'wrong-passphrase-length',
  WRONG_REC_KEYS = 'corrupted-recovery-keys',
  WRONG_POST_NAME_FORMAT = 'wrong-post-name-format',
  WRONG_POST_NAME_LENGTH = 'wrong-post-name-length',
  WRONG_POST_DESC_FORMAT = 'wrong-post-description-format',
  WRONG_POST_DESC_LENGTH = 'wrong-post-description-length'
}
