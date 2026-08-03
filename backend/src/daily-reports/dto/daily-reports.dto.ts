import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateDailyReportDto {
  @IsString()
  @IsNotEmpty()
  workCompleted: string;

  @IsString()
  @IsOptional()
  problems?: string;

  @IsString()
  @IsNotEmpty()
  tomorrowPlan: string;

  @IsArray()
  @IsOptional()
  hospitalVisits?: string[];

  @IsArray()
  @IsOptional()
  meetings?: string[];

  @IsArray()
  @IsOptional()
  calls?: string[];
}

export class ReviewDailyReportDto {
  @IsString()
  @IsNotEmpty()
  status: string; // REVIEWED, PENDING

  @IsString()
  @IsOptional()
  reviewRemarks?: string;
}
