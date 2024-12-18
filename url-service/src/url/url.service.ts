import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Url } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { randomUUID } from 'node:crypto';
import { CreateShortUrlDto } from 'src/DTOs/createShortUrlDto';

@Injectable()
export class UrlService {
  constructor(
    private prisma: PrismaService
  ) {}


  async createShortUrl(data: CreateShortUrlDto, userId: string): Promise<string> {
    while (true) {
      const shortUrl = this.generateCompactUUID();
  
      try {
        await this.prisma.url.create({
          data: {
            shortUrl,
            originalUrl: data.originalUrl,
            userId
          },
        });
        const baseUrl = process.env.BASE_URL || 'http://localhost:3002'
        const finalUrl = `${baseUrl}/${shortUrl}`;
        return finalUrl;
      } catch (error) {
        if (error.code === 'P2002') { 
          continue;
        }
        throw error;
      }
    }
  }

  generateCompactUUID(): string {
    const BASE62_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Função para converter BigInt para Base62
    const toBase62 = (num: bigint): string => {
      let result = '';
      const base = BigInt(BASE62_CHARSET.length);
  
      while (num > 0) {
        const remainder = num % base;
        result = BASE62_CHARSET[Number(remainder)] + result;
        num = num / base;
      }
  
      return result || '0'; // Retorna '0' se o número for 0
    };
  
    try {
      const uuid = randomUUID().replace(/-/g, ''); // Remove os traços do UUID
      const bigIntValue = BigInt(`0x${uuid}`); // Converte UUID hexadecimal para BigInt
      const base62 = toBase62(bigIntValue); // Converte para Base62
      return base62.slice(0, 6); // Retorna os primeiros 6 caracteres
    } catch (error) {
      throw new Error(`Error generating compact UUID: ${(error as Error).message}`);
    }
  }

  async url(
    urlWhereUniqueInput: Prisma.UrlWhereUniqueInput,
  ): Promise<Url | null> {
    return this.prisma.url.findFirst({
      where: {
        ...urlWhereUniqueInput,
        deletedAt: null
      },
    });
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    const url = await this.url({shortUrl: shortCode});
    if(!url) {
      throw new NotFoundException('Url not found.')
    }

    await this.prisma.click.create({
      data: {
        urlId: url.id
      }
    });

    return url.originalUrl;
  }


  async getUrlsWithClickCount(userId: string): Promise<
    Array<{ id: string; shortUrl: string; originalUrl: string; createdAt: Date; clickCount: number }>
  > {
    return this.prisma.url.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        shortUrl: true,
        originalUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            clicks: true,
          },
        },
      },
    }).then(urls =>
      urls.map(url => ({
        id: url.id,
        shortUrl: url.shortUrl,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
        clickCount: url._count.clicks, 
      })),
    );
  }

  async deleteUrl(userId: string, urlId: string) {
    const url = await this.url({ id: urlId });

    if(!url || url.userId !== userId) {
      throw new NotFoundException();
    }

    await this.prisma.url.delete({
      where: {
        id: urlId
      }
    });

  }

  async updateUrl(userId: string, urlId: string, updateData: Prisma.UrlUpdateInput) {
    const url = await this.url({ id: urlId });

    if(!url || url.userId !== userId) {
      throw new NotFoundException();
    }

    await this.prisma.url.update({
      where: {
        id: urlId
      },
      data: updateData
    });

  }

  async getUrlInfo(userId: string, urlId: string) {
    const url = await this.url({ id: urlId });

    if(!url || url.userId !== userId) {
      throw new NotFoundException();
    }

    return url;

  }

}
