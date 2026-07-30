import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateInstallationDto {
  @IsNumber()
  customerId!: number;

  @IsNumber()
  machineId!: number;

  @IsString()
  @IsOptional()
  warrantyCardNumber?: string;

  @IsString()
  @IsNotEmpty()
  installationDate!: string;

  @IsNumber()
  @IsOptional()
  warrantyYears?: number; // Defaults to 1 if not specified

  @IsNumber()
  @IsOptional()
  pmIntervalMonths?: number; // Defaults to 3 if not specified

  @IsNumber()
  @IsOptional()
  engineerId?: number;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsString()
  @IsOptional()
  customerPo?: string;
}

export class CreateAmcDto {
  @IsNumber()
  customerId!: number;

  @IsNumber()
  installationId!: number;

  @IsString()
  @IsNotEmpty()
  contractNumber!: string;

  @IsString()
  @IsNotEmpty()
  type!: 'FREE' | 'PAID';

  @IsNumber()
  value!: number;

  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @IsString()
  @IsNotEmpty()
  endDate!: string;
}
