import { IsNotEmpty, IsString, IsUrl, } from "class-validator";

export class CreateShortUrlDto {
  @IsNotEmpty()
  originalUrl: string;
}