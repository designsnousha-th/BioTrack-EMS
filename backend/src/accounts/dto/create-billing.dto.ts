import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateBillingDto {
  @IsNumber()
  customerId!: number;

  @IsNumber()
  @IsOptional()
  serviceCallId?: number;

  @IsNumber()
  amount!: number;

  @IsNumber()
  taxAmount!: number;

  @IsNumber()
  totalAmount!: number;
}
