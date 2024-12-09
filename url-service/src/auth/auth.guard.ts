import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject()
  private readonly httpService: HttpService

  async canActivate(context: ExecutionContext): Promise<boolean>{
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if(!authorization) {
      throw new UnauthorizedException('Token is required.')
    }

    try {
      const authServiceBaseUrl = process.env.AUTH_API_URL || 'http://localhost:3001';

      const authResponse = await firstValueFrom(
        this.httpService.post(`${authServiceBaseUrl}/auth/validate`, { accessToken: authorization })
      );

      if(authResponse.data.valid == false) {
        throw new UnauthorizedException('Invalid Token.')
      }else {
        const userInfo = {
          id: authResponse.data.userId
        }

        request.user = userInfo;

      }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid Token.')
    }
    return true;
  }
}
