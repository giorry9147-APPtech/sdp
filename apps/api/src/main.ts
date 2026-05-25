import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { PrismaService } from './common/prisma.service';

// BigInt → string voor JSON-serialisatie (AuditLog.id is bigint).
// Prototype-patch, geen apart pad nodig per controller.
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');

  // CORS — laat localhost altijd toe, plus expliciete origins via env,
  // plus alle Vercel preview-deploys (*.vercel.app) als toegestaan.
  const explicietOrigins = (process.env.WEB_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server / curl
      if (
        origin.startsWith('http://localhost:') ||
        explicietOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS geweigerd voor origin: ${origin}`));
    },
    credentials: true,
  });

  // Vertrouw één proxy voor X-Forwarded-* headers (Fly, Vercel, Render)
  const expressApp = app.getHttpAdapter().getInstance() as { set: (k: string, v: unknown) => void };
  expressApp.set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Audit interceptor — vangt alle write-acties op
  const prisma = app.get(PrismaService);
  app.useGlobalInterceptors(new AuditInterceptor(prisma));

  // OpenAPI spec (e-Suriname compatibel — gepubliceerd voor S-Road)
  const swagger = new DocumentBuilder()
    .setTitle('SDP API')
    .setDescription(
      'Suriname Decentralisatie Platform — REST API. ' +
      'Ontworpen voor S-Road interoperabiliteit (e-Suriname spoor).',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('publiek', 'Endpoints zonder authenticatie (burger-meldpunt)')
    .addTag('auth', 'Authenticatie & sessies')
    .addTag('districten', 'Bestuurlijke structuur — districten')
    .addTag('ressorten', 'Bestuurlijke structuur — ressorten')
    .addTag('meldingen', 'Burgermeldingen openbare ruimte')
    .addTag('vergunningen', 'Vergunningen (Hinderwet, markt, evenement, etc.)')
    .addTag('projecten', 'Districtsprojecten')
    .addTag('plannen', 'Ressortplannen & districtsplannen (decentralisatie)')
    .addTag('dashboards', 'DC- en RO-dashboards')
    .build();
  const doc = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api/docs', app, doc, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`▶ SDP API gestart op http://localhost:${port}`);
  logger.log(`▶ OpenAPI docs: http://localhost:${port}/api/docs`);
}

void bootstrap();
