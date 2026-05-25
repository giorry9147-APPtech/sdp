import { Global, Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService, IDENTITY_PROVIDER } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RbacGuard } from './rbac';
import { EmailPasswordProvider } from './providers/email-password.provider';
import { DigitaleIdProvider } from './providers/digitale-id.provider';
import type { IdentityProvider } from './identity-provider.interface';

/**
 * Auth module — selecteert de identity-provider op basis van env var
 * AUTH_PROVIDER. Andere modules werken met de abstracte interface en
 * weten dus NIET welke provider actief is.
 *
 * Mogelijke waarden:
 *   - 'email-password'  (default, MVP)
 *   - 'digitale-id'     (stub, niet geïmplementeerd)
 */
@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      signOptions: { expiresIn: process.env.JWT_ACCESS_TTL ?? '15m' },
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    EmailPasswordProvider,
    DigitaleIdProvider,
    {
      provide: IDENTITY_PROVIDER,
      inject: [EmailPasswordProvider, DigitaleIdProvider],
      useFactory: (
        emailPw: EmailPasswordProvider,
        digId: DigitaleIdProvider,
      ): IdentityProvider => {
        const logger = new Logger('AuthModule');
        const choice = (process.env.AUTH_PROVIDER ?? 'email-password').toLowerCase();
        switch (choice) {
          case 'digitale-id':
            logger.warn(
              'AUTH_PROVIDER=digitale-id — stub-provider actief, niet geschikt voor productie',
            );
            return digId;
          case 'email-password':
          default:
            logger.log('AUTH_PROVIDER=email-password (MVP-default)');
            return emailPw;
        }
      },
    },
    AuthService,
    JwtAuthGuard,
    RbacGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RbacGuard, JwtModule],
})
export class AuthModule {}
