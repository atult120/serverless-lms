import { Type } from "class-transformer";
import { IsString, IsOptional, IsUrl, IsEnum, IsInt, IsBoolean, IsArray, ArrayMaxSize, ValidateIf, Length, IsNotEmpty } from "class-validator";

export class CreateHowToVideoItem {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;
  @IsOptional() @IsString() description?: string;   
  @IsString() @IsUrl() video_url!: string;
  @IsOptional() @IsUrl() thumbnail_url?: string;
  @IsOptional() @IsEnum(['s3','youtube','vimeo','external']) provider?: string;
  @IsOptional() @IsInt() duration_seconds?: number;
  @IsOptional() @IsEnum(['draft','published','archived']) status?: string;
  @IsOptional() @IsBoolean() is_protected?: boolean;
  @ValidateIf(o => o.is_protected == true)
  @IsString()
  @Length(8, 255, { message: 'Password hash must be between 8 and 255 characters' })
  password!: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() metadata?: any;
}

// wrapper DTO
export class CreateHowToVideoDto {
  @IsArray()
  @ArrayMaxSize(50)
  @Type(() => CreateHowToVideoItem)
  videos!: CreateHowToVideoItem[];
}