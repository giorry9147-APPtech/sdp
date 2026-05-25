import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AanvragerSoort, VergunningStatus } from '@prisma/client';

export class PubliekeAanvraagDto {
  @ApiProperty()
  @IsInt()
  districtId!: number;

  @ApiProperty({ description: 'Categorie-ID (zie GET /categorieen?type=vergunning)' })
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
  beschrijving!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  locatieOmschrijving?: string;

  // Aanvrager
  @ApiProperty({ enum: AanvragerSoort })
  @IsEnum(AanvragerSoort)
  aanvragerSoort!: AanvragerSoort;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  aanvragerNaam!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  aanvragerTelefoon!: string;

  @ApiProperty()
  @IsEmail()
  aanvragerEmail!: string;

  @ApiProperty({
    required: false,
    description: 'KKF-inschrijfnummer (verplicht bij ONDERNEMING)',
  })
  @ValidateIf((o: PubliekeAanvraagDto) => o.aanvragerSoort === AanvragerSoort.ONDERNEMING)
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  aanvragerKkfNummer?: string;
}

export class StatusWijzigingDto {
  @ApiProperty({
    enum: VergunningStatus,
    description:
      'Tussentijdse status: IN_BEHANDELING, EXTRA_INFO_NODIG, BEZWAAR, INGETROKKEN',
  })
  @IsEnum(VergunningStatus)
  status!: VergunningStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  opmerking?: string;
}

export class BesluitDto {
  @ApiProperty({
    enum: ['GOEDGEKEURD', 'AFGEWEZEN'],
    description: 'Eindbesluit DC',
  })
  @IsEnum(VergunningStatus)
  status!: VergunningStatus;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  besluit!: string;
}
