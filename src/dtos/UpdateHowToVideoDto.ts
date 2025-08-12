import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, ValidateIf, Length, IsNotEmpty } from "class-validator";

export class UpdateHowToVideoDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], { message: 'Status must be draft, published, or archived' })
  status?: string;

  @IsOptional()
  @IsBoolean({ message: 'is_protected must be a boolean' })
  is_protected?: boolean;

  @ValidateIf(o => o.is_protected === true)
  @IsNotEmpty({ message: 'Password is required when video is protected' })
  @IsString({ message: 'Password must be a string' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters' })
  password?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @IsOptional()
  @IsString({ message: 'Thumbnail URL must be a string' })
  thumbnail_url?: string;
}