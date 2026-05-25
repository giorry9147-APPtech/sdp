import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import type { Request } from 'express';
import { AuthService, type LoginResult } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedUser } from '../common/types';

/** Serialiseert AuthenticatedUser (heeft Set) naar JSON-vriendelijk object. */
function serialiseer(r: LoginResult) {
  return {
    accessToken: r.accessToken,
    refreshToken: r.refreshToken,
    user: {
      id: r.user.id,
      email: r.user.email,
      naam: r.user.naam,
      rollen: r.user.rollen,
      permissies: Array.from(r.user.permissies),
    },
  };
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(8)
  wachtwoord!: string;
}

class RefreshDto {
  @IsNotEmpty()
  refreshToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login met de actieve identity-provider' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const r = await this.auth.login({
      email: dto.email,
      wachtwoord: dto.wachtwoord,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return serialiseer(r);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Wissel refresh-token in voor nieuw access-token' })
  async refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    const r = await this.auth.refresh(dto.refreshToken, req.ip);
    return serialiseer(r);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Trek refresh-token in' })
  async logout(@Body() dto: RefreshDto) {
    await this.auth.logout(dto.refreshToken);
    return { ok: true };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Profiel + rollen van de ingelogde gebruiker' })
  me(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return {
      id: user.id,
      email: user.email,
      naam: user.naam,
      rollen: user.rollen,
      permissies: Array.from(user.permissies),
    };
  }
}
