import { Controller, Post, Body, Param, Get, Res, Req, UnauthorizedException } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortUrlDto } from 'src/DTOs/createShortUrlDto';
import { HttpService } from '@nestjs/axios';

@Controller()
export class UrlController {
  constructor(
    private urlService: UrlService,
    private httpService: HttpService
  ) {}


  @Post()
  async createShortUrl(@Body() data: CreateShortUrlDto, @Req() req ): Promise<{ shortUrl: string }> {
    const authorizationHeader = req.headers['authorization'];
    console.log('authorizationHeader: ', authorizationHeader);
    let userId;
    
    if (!authorizationHeader) {
      userId = null;
    } else {

      const authServiceBaseUrl = process.env.AUTH_API_URL || 'http://localhost:3001';

      const authResponse = await this.httpService
      .post(`${authServiceBaseUrl}/auth/validate`, { accessToken: authorizationHeader }) // Substitua '/validate' com o endpoint correto da sua API de autenticação
      .toPromise();

      userId = authResponse.data.userId
    }
    
    
    const shortUrl = await this.urlService.createShortUrl(data, userId);

    return {
      shortUrl
    }
  }

  @Get(':urlShortCode')
  async redirectToOriginalUrl(@Param() params: {urlShortCode: string}, @Res() res) {
    const originalUrl = await this.urlService.getOriginalUrl(params.urlShortCode);

    res.redirect(originalUrl);
  }
}
