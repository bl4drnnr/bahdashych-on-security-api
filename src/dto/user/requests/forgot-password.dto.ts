import { IsEnum, IsOptional, Matches } from 'class-validator';
import { EmailRegex } from '@regex/email.regex';
import { ValidationError } from '@interfaces/validation-error.enum';
import { Language } from '@interfaces/language.enum';

export class ForgotPasswordDto {
  @Matches(EmailRegex, {
    message: ValidationError.WRONG_EMAIL_FORMAT
  })
  readonly email: string;

  @IsOptional()
  @IsEnum(Language, { message: ValidationError.WRONG_LANGUAGES_FORMAT })
  readonly language?: Language;
}
