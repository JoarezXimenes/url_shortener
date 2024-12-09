import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignUpBodyDto } from './DTOs/signUpBodyDto';
import { AuthService } from './auth.service';

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
}
