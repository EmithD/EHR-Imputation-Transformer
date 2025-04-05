import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, IsDate } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsOptional()
    displayName: string;
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
    
    @IsString()
    @IsOptional()
    googleAccessToken?: string;

    @IsString()
    @IsOptional()
    googleRefreshToken?: string;

    @IsString()
    @IsUrl()
    @IsOptional()
    googleAvatarUrl?: string;
}
