import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class SignUpBodyDto {
  
  @IsNotEmpty() @IsEmail()
  email: string;

  @IsNotEmpty() @Length(8, 30)
  password: string;
}