import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

export type PresignedUploadOpts = {
  /** S3-key onder welke het object wordt opgeslagen. */
  key: string;
  /** MIME-type — wordt vastgezet zodat de client niet ander type uploadt. */
  contentType: string;
  /** Geldigheid in seconden. Default 5 minuten. */
  expiresInSec?: number;
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBase?: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION ?? 'us-east-1';
    const forcePathStyle =
      (process.env.S3_FORCE_PATH_STYLE ?? 'true').toLowerCase() === 'true';
    this.bucket = process.env.S3_BUCKET ?? 'sdp-uploads';
    this.publicBase = process.env.S3_PUBLIC_BASE_URL;

    this.client = new S3Client({
      endpoint,
      region,
      forcePathStyle,
      credentials:
        process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY,
              secretAccessKey: process.env.S3_SECRET_KEY,
            }
          : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    // Voor lokale MinIO: zorg dat de bucket bestaat. Faalt zacht in test/CI.
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(
        `Bucket ${this.bucket} niet bereikbaar (${msg}) — probeer aanmaken`,
      );
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket ${this.bucket} aangemaakt`);
      } catch (createErr: unknown) {
        const cmsg = createErr instanceof Error ? createErr.message : String(createErr);
        this.logger.warn(
          `Kon bucket niet aanmaken (${cmsg}) — uploads zullen falen tot S3 bereikbaar is`,
        );
      }
    }
  }

  /** Genereer een S3-key voor een melding-bijlage. */
  bijlageKey(meldingId: number, bestandsnaam: string): string {
    const safe = bestandsnaam.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    return `meldingen/${meldingId}/${randomUUID()}-${safe}`;
  }

  /** Presigned URL voor PUT-upload door browser. */
  async presignUpload(opts: PresignedUploadOpts): Promise<string> {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: opts.key,
      ContentType: opts.contentType,
    });
    try {
      return await getSignedUrl(this.client, cmd, {
        expiresIn: opts.expiresInSec ?? 300,
      });
    } catch (e) {
      this.logger.error(`Presign upload faalde voor ${opts.key}: ${e}`);
      throw new InternalServerErrorException('Kon upload-URL niet genereren');
    }
  }

  /** Presigned URL voor GET-download (intern, na auth-check in controller). */
  async presignDownload(key: string, expiresInSec = 300): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresInSec });
  }

  async verwijder(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (e) {
      this.logger.warn(`Verwijderen ${key} faalde: ${e}`);
    }
  }

  /** Publieke base-URL (optioneel; alleen voor read-only buckets / CDN). */
  get publicBaseUrl(): string | undefined {
    return this.publicBase;
  }
}
