import {
  IsEmail,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
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
