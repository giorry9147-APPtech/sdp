import {
  IsEmail,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MeldingStatus, Urgentie } from '@prisma/client';

export class NieuweMeldingDto {
  @ApiProperty({ description: 'District-ID (zie GET /districten)' })
  @IsInt()
  districtId!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  ressortId?: number;

  @ApiProperty({ description: 'Categorie-ID (zie GET /categorieen?type=melding)' })
  @IsInt()
  categorieId!: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titel!: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({ required: false, enum: Urgentie })
  @IsOptional()
  @IsEnum(Urgentie)
  urgentie?: Urgentie;

  // Melder (optioneel; magic-link voor terugkoppeling)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  melderNaam?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  melderTelefoon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  melderEmail?: string;

  @ApiProperty({ default: false, description: 'Toestemming om contact op te nemen' })
  @IsOptional()
  melderConsent?: boolean;
}

export class StatusWijzigingDto {
  @ApiProperty({ enum: MeldingStatus })
  @IsEnum(MeldingStatus)
  status!: MeldingStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  opmerking?: string;
}

export class ToewijzenDto {
  @ApiProperty({ description: 'Gebruiker-ID waar de melding aan toegewezen wordt' })
  @IsString()
  toegewezenAanId!: string;
}

// ─── B1 Foto-upload ──────────────────────────────────────────────────

/** Toegestane MIME-types voor melding-bijlages (foto + PDF voor evt. brief). */
export const TOEGESTANE_BIJLAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
] as const;

export const MAX_BIJLAGES_PER_MELDING = 5;
export const MAX_BIJLAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export class BijlagePresignDto {
  @ApiProperty({ description: 'Originele bestandsnaam' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  bestandsnaam!: string;

  @ApiProperty({ description: 'MIME-type — moet in TOEGESTANE_BIJLAGE_TYPES staan' })
  @IsString()
  @MaxLength(80)
  mimeType!: string;

  @ApiProperty({ description: 'Verwachte bestandsgrootte in bytes' })
  @IsInt()
  @IsPositive()
  @Max(MAX_BIJLAGE_BYTES)
  grootte!: number;
}

export class BijlageRegistreerDto extends BijlagePresignDto {
  @ApiProperty({ description: 'S3-key teruggekregen van /presign' })
  @IsString()
  @MaxLength(500)
  fileKey!: string;
}

// ─── B4 Burger-feedback / B5 Heropenen ───────────────────────────────

export class BurgerFeedbackDto {
  @ApiProperty({
    enum: ['BEVESTIGD', 'NIET_OPGELOST'],
    description: 'BEVESTIGD = probleem is verholpen, NIET_OPGELOST = terug in behandeling',
  })
  @IsEnum(['BEVESTIGD', 'NIET_OPGELOST'])
  oordeel!: 'BEVESTIGD' | 'NIET_OPGELOST';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  opmerking?: string;
}

export class HeropenDto {
  @ApiProperty({ description: 'Toelichting waarom de burger de melding heropent' })
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  reden!: string;
}

export class EscaleerDto {
  @ApiProperty({ description: 'Toelichting voor RO over waarom geëscaleerd wordt' })
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  reden!: string;
}
