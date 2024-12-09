import { IsNotEmpty, IsString} from "class-validator";

export class ValidateTokenDto {
  
  @IsNotEmpty() @IsString()
  accessToken: string;
}