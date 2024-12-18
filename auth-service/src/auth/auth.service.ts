import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async createUser(data: Prisma.UserCreateInput) {
    const hashPassword = await bcrypt.hash(data.password, 10);

    const existentUser = await this.user({email: data.email})

    if(existentUser) {
      throw new ConflictException()
    }

    return this.prisma.user.create({ data: {
      ...data,
      password: hashPassword
    } });
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async signIn(data: Prisma.UserCreateInput): Promise<{ access_token: string}> {
    const user = await this.user({email: data.email});

    if(!user) {
      throw new NotFoundException('User not found')
    }

    const validPassword = await bcrypt.compare(data.password, user.password);

    if(!validPassword) {
      throw new UnauthorizedException('Invalid email or password')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payload = { sub: user.id }

    return {access_token: await this.jwtService.signAsync(payload)};
  }


  async validateToken(bearerToken: string): Promise<{ valid: boolean, userId: string | null }> {
    try {
      const token = bearerToken.split(' ')[1];
      if (!token) {
        return { valid: false, userId: null };
      }

      const decoded = await this.jwtService.verifyAsync(token);

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        return { valid: false, userId: null };
      }

      return { valid: true, userId: user.id };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch(error) {
      // Se ocorrer algum erro na verificação ou no banco de dados
      return { valid: false, userId: null };
    }
  }
}
