import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PlanStatus, Urgentie } from '@prisma/client';

export class PrioriteitDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titel!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  onderbouwing!: string;

  @ApiProperty({ enum: Urgentie, required: false })
  @IsOptional()
  @IsEnum(Urgentie)
  urgentie?: Urgentie;

  @ApiProperty({ required: false, description: 'Kostenraming in SRD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  kostenraming?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  doelgroep?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  verwachteImpact?: string;
}

export class NieuwRessortplanDto {
  @ApiProperty()
  @IsInt()
  ressortId!: number;

  @ApiProperty({ description: 'Jaar waarvoor het plan geldt' })
  @IsInt()
  @Min(2025)
  @Max(2099)
  jaar!: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titel!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  inleiding?: string;

  @ApiProperty({ type: [PrioriteitDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PrioriteitDto)
  prioriteiten!: PrioriteitDto[];
}

export class NieuwDistrictsplanDto {
  @ApiProperty()
  @IsInt()
  districtId!: number;

  @ApiProperty()
  @IsInt()
  @Min(2025)
  @Max(2099)
  jaar!: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titel!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  inleiding?: string;

  @ApiProperty({ type: [PrioriteitDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PrioriteitDto)
  prioriteiten!: PrioriteitDto[];
}

export class StatusOvergangDto {
  @ApiProperty({ enum: PlanStatus })
  @IsEnum(PlanStatus)
  status!: PlanStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  opmerking?: string;
}
