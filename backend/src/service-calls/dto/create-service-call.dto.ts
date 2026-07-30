import { IsNumber, IsOptional, IsString, IsNotEmpty, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CallPriority, CallStatus } from '@prisma/client';

export class CreateServiceCallDto {
  @IsNumber()
  customerId!: number;

  @IsNumber()
  installationId!: number;

  @IsString()
  @IsNotEmpty()
  reportedProblem!: string;

  @IsEnum(CallPriority)
  @IsOptional()
  priority?: CallPriority;

  @IsNumber()
  @IsOptional()
  assignedEngineerId?: number;
}

export class PartUsedItemDto {
  @IsNumber()
  sparePartId!: number;

  @IsNumber()
  quantity!: number;
}

export class UpdateServiceCallDto {
  @IsEnum(CallStatus)
  @IsOptional()
  status?: CallStatus;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  @IsOptional()
  laborCharge?: number;

  @IsNumber()
  @IsOptional()
  travelCharge?: number;

  @IsString()
  @IsOptional()
  customerSignature?: string; // base64 string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartUsedItemDto)
  @IsOptional()
  partsUsed?: PartUsedItemDto[];
}

export class CompletePmDto {
  @IsString()
  @IsNotEmpty()
  checklistReport!: string;

  @IsNumber()
  engineerId!: number;

  @IsString()
  @IsOptional()
  signature?: string;
}
