import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  MinLength,
  ValidateNested
} from 'class-validator';
import { ValidationError } from '@interfaces/validation-error.enum';
import { Language } from '@interfaces/language.enum';
import { Type } from 'class-transformer';

class CategoryDto {
  @IsString({ message: ValidationError.WRONG_CATEGORY_NAME_FORMAT })
  @MinLength(1, {
    message: ValidationError.WRONG_CATEGORY_NAME_LENGTH
  })
  readonly categoryName: string;

  @IsString({ message: ValidationError.WRONG_CATEGORY_DESC_FORMAT })
  @MinLength(1, {
    message: ValidationError.WRONG_CATEGORY_DESC_LENGTH
  })
  readonly categoryDescription: string;

  @IsEnum(Language, { message: ValidationError.WRONG_LANGUAGES_FORMAT })
  readonly categoryLanguage: Language;
}

export class CreateCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(3, {
    message: ValidationError.WRONG_CATEGORIES_LENGTH
  })
  @ArrayMaxSize(3, {
    message: ValidationError.WRONG_CATEGORIES_LENGTH
  })
  @Type(() => CategoryDto)
  readonly categories: Array<CategoryDto>;
}
