import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NieuwVerzoekDto {
  @ApiProperty({ description: 'Zaaktype-code (zie GET /zaaktypen?kanaal=G2G), bv. DOMEINGROND' })
  @IsString()
  @MaxLength(60)
  zaaktypeCode!: string;

  @ApiProperty({ description: 'District-ID waar het verzoek naartoe gaat' })
  @IsInt()
  districtId!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  ressortId?: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  onderwerp!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  omschrijving!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  locatieOmschrijving?: string;

  @ApiProperty({ required: false, description: 'Dossiernr/referentie van de indienende dienst' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  externeReferentie?: string;

  @ApiProperty({
    required: false,
    description: 'Zaaktype-specifieke velden (sleutel = Eigenschap.code), bv. { "LAD_nr": "12345" }',
  })
  @IsOptional()
  @IsObject()
  eigenschappen?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}

// ─── DC-kant (EO6) ────────────────────────────────────────────────────

export class StatusWijzigDto {
  @ApiProperty({ description: 'Doel-statuscode (zie zaaktype.statustypen)' })
  @IsString()
  @MaxLength(60)
  statusCode!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  opmerking?: string;
}

export class BeantwoordDto {
  @ApiProperty({ description: 'Resultaatcode (zie zaaktype.resultaattypen), bv. GEEN_BEZWAAR' })
  @IsString()
  @MaxLength(60)
  resultaatCode!: string;

  @ApiProperty({ description: 'Motivatie van het advies/besluit' })
  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  antwoord!: string;
}

export class IntrekkenDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reden?: string;
}

// ─── Bijlages (EO7) ───────────────────────────────────────────────────

export const TOEGESTANE_VERZOEK_BIJLAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export const MAX_VERZOEK_BIJLAGES = 10;
export const MAX_VERZOEK_BIJLAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export class VerzoekBijlagePresignDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  bestandsnaam!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  mimeType!: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @Max(MAX_VERZOEK_BIJLAGE_BYTES)
  grootte!: number;
}

export class VerzoekBijlageRegistreerDto extends VerzoekBijlagePresignDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  fileKey!: string;

  @ApiProperty({
    required: false,
    enum: ['OPENBAAR', 'INTERN', 'VERTROUWELIJK', 'CONFIDENTIEEL'],
    description: 'Default = vertrouwelijkheid van de zaak',
  })
  @IsOptional()
  @IsEnum(['OPENBAAR', 'INTERN', 'VERTROUWELIJK', 'CONFIDENTIEEL'])
  vertrouwelijkheid?: 'OPENBAAR' | 'INTERN' | 'VERTROUWELIJK' | 'CONFIDENTIEEL';
}
