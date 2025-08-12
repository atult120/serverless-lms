import { IsString, IsOptional, IsUrl, IsEnum, IsInt, IsBoolean, IsArray, ValidateIf, Length, IsNotEmpty } from "class-validator";

export class CreateHowToVideoDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsOptional() 
  @IsString() 
  description?: string;   

  @IsString() 
  @IsUrl() 
  video_url!: string;

  @IsOptional() 
  @IsUrl() 
  thumbnail_url?: string;

  @IsOptional() 
  @IsEnum(['s3','youtube','vimeo','external']) 
  provider?: string;

  @IsOptional() 
  @IsInt() 
  duration_seconds?: number;

  @IsOptional() 
  @IsEnum(['enabled','disabled','unpublished']) 
  status?: string;

  @IsOptional() 
  @IsBoolean() 
  is_protected?: boolean;

  @ValidateIf(o => o.is_protected === true)
  @IsNotEmpty({ message: 'Password is required when video is protected' })
  @IsString({ message: 'Password must be a string' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters' })
  password?: string;

  @IsOptional() 
  @IsArray() 
  tags?: string[];

  @IsOptional() 
  metadata?: any;
}