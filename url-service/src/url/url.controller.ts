import { Controller, Post, Body, Param, Get, Res, Req, UseGuards, Delete, Put} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortUrlDto } from 'src/DTOs/createShortUrlDto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller()
export class UrlController {
  constructor(
    private urlService: UrlService,
    private httpService: HttpService
  ) {}


  @Post('url')
  async createShortUrl(@Body() data: CreateShortUrlDto, @Req() req ): Promise<{ shortUrl: string }> {
    const authorization = req.headers['authorization'];
    let userId;
    
    if (!authorization) {
      userId = null;
    } else {

      const authServiceBaseUrl = process.env.AUTH_API_URL || 'http://localhost:3001';

      const authResponse = await firstValueFrom(
        this.httpService.post(`${authServiceBaseUrl}/auth/validate`, { accessToken: authorization })
      );

      userId = authResponse.data.userId
    }
    
    
    const shortUrl = await this.urlService.createShortUrl(data, userId);

    return {
      shortUrl
    }
  }

  @UseGuards(AuthGuard)
  @Get('url/list')
  async listUserUrls(@Req() req ) {
    const { id } = req.user;

    const urlList = await this.urlService.getUrlsWithClickCount(id);

    return urlList;
  }

  @UseGuards(AuthGuard)
  @Delete('url/:id')
  async deleteUrl(@Param() params: {id: string}, @Req() req ) {
    const userId = req.user.id;
    const urlId = params.id;

    await this.urlService.deleteUrl(userId, urlId);

    return;
  }

  @UseGuards(AuthGuard)
  @Put('url/:id')
  async updateUrl(@Param() params: {id: string}, @Body() data: CreateShortUrlDto, @Req() req ) {
    const userId = req.user.id;
    const urlId = params.id;

    await this.urlService.updateUrl(userId, urlId, data);

    return;
  }

  @UseGuards(AuthGuard)
  @Get('url/:id')
  async getUrlInfo(@Param() params: {id: string}, @Req() req ) {
    const userId = req.user.id;
    const urlId = params.id;

    const urlInfo = await this.urlService.getUrlInfo(userId, urlId);

    return urlInfo;
  }

  @Get(':urlShortCode')
  async redirectToOriginalUrl(@Param() params: {urlShortCode: string}, @Res() res) {
    const originalUrl = await this.urlService.getOriginalUrl(params.urlShortCode);

    res.redirect(originalUrl);
  }

}
