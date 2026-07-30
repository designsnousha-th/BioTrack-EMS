import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  partNumber!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsNumber()
  @IsOptional()
  minStockLevel?: number;

  @IsNumber()
  @IsOptional()
  unitCost?: number;
}
