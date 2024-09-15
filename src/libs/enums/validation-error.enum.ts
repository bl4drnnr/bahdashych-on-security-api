export enum ValidationError {
  WRONG_EMAIL_FORMAT = 'wrong-email-format',
  WRONG_IMAGE_FORMAT = 'user-photo-must-be-base64',
  WRONG_LINK_FORMAT = 'wrong-link-format',
  WRONG_DATE_FORMAT = 'wrong-date-format',
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
  WRONG_ARTICLE_NAME_FORMAT = 'wrong-article-name-format',
  WRONG_ARTICLE_NAME_LENGTH = 'wrong-article-name-length',
  WRONG_ARTICLE_DESC_FORMAT = 'wrong-article-description-format',
  WRONG_ARTICLE_DESC_LENGTH = 'wrong-article-description-length',
  WRONG_CATEGORY_NAME_FORMAT = 'wrong-category-name-format',
  WRONG_CATEGORY_NAME_LENGTH = 'wrong-category-name-length',
  WRONG_CATEGORY_DESC_FORMAT = 'wrong-category-description-format',
  WRONG_CATEGORY_DESC_LENGTH = 'wrong-category-description-length',
  WRONG_ARTICLE_CONTENT_FORMAT = 'wrong-category-content-format',
  WRONG_ARTICLE_CONTENT_LENGTH = 'wrong-category-content-length',
  WRONG_CATEGORY_ID_FORMAT = 'wrong-category-id-format',
  WRONG_ARTICLE_ID_FORMAT = 'wrong-article-id-format',
  WRONG_CATEGORIES_LENGTH = 'wrong-categories-length',
  WRONG_ARTICLES_LENGTH = 'wrong-articles-length',
  WRONG_AUTHOR_FIRST_NAME_FORMAT = 'wrong-author-first-format',
  WRONG_AUTHOR_FIRST_NAME_LENGTH = 'wrong-author-first-length',
  WRONG_AUTHOR_LAST_NAME_FORMAT = 'wrong-author-last-format',
  WRONG_AUTHOR_LAST_NAME_LENGTH = 'wrong-author-last-length',
  WRONG_COMPANY_NAME_FORMAT = 'wrong-company-name-format',
  WRONG_COMPANY_NAME_LENGTH = 'wrong-company-name-length',
  WRONG_COMPANY_DESC_FORMAT = 'wrong-company-desc-format',
  WRONG_COMPANY_DESC_LENGTH = 'wrong-company-desc-length',
  WRONG_CERT_NAME_FORMAT = 'wrong-cert-name-format',
  WRONG_CERT_NAME_LENGTH = 'wrong-cert-name-length',
  WRONG_CERT_DESC_FORMAT = 'wrong-cert-desc-format',
  WRONG_CERT_DESC_LENGTH = 'wrong-cert-desc-length',
  WRONG_COMPANY_LINK_TITLE_FORMAT = 'wrong-company-link-title-format',
  WRONG_COMPANY_LINK_TITLE_LENGTH = 'wrong-company-link-title-length',
  WRONG_AUTHOR_ID_FORMAT = 'wrong-author-id-format',
  WRONG_EXPERIENCE_ID_FORMAT = 'wrong-experience-id-format',
  WRONG_CERTIFICATION_ID_FORMAT = 'wrong-certification-id-format',
  WRONG_CONTACT_NAME_FORMAT = 'wrong-contact-name-format',
  WRONG_CONTACT_NAME_LENGTH = 'wrong-contact-name-length',
  WRONG_CONTACT_MESSAGE_FORMAT = 'wrong-contact-message-format',
  WRONG_CONTACT_MESSAGE_LENGTH = 'wrong-contact-message-length',
  WRONG_PDF_NAME_FORMAT = 'wrong-pdf-name-format'
}
