import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignUpBodyDto } from './DTOs/signUpBodyDto';
import { AuthService } from './auth.service';
import { ValidateTokenDto } from './DTOs/validateTokenDto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Post('signup')
  async signUp(@Body() body: SignUpBodyDto): Promise<void> {
    await this.authService.createUser(body)
    return;
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: SignUpBodyDto): Promise<{ access_token: string}> {
    const response = await this.authService.signIn(body);
    return response;
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() body: ValidateTokenDto): Promise<{ valid: boolean, userId: string | null}> {
    const response = await this.authService.validateToken(body.accessToken)
    return response;
  }
}
