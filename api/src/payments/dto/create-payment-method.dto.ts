import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  userId: string;

  @IsString()
  cardNumber: string;

  @IsInt()
  @Min(1)
  @Max(12)
  expMonth: number;

  @IsInt()
  expYear: number;

  @IsString()
  cvv: string;

  @IsOptional()
  @IsInt()
  amountCents?: number;

  @IsOptional()
  @IsString()
  currency?: string = 'EUR';

  @IsOptional()
  @IsBoolean()
  recurring?: boolean = false;

  @IsString()
  customerIP: string;

  @IsOptional()
  @IsIn(['frontend', 'server'])
  tokenizeVia?: 'frontend' | 'server' = 'server';
}
