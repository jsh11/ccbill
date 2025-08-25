import { IsIn, IsInt, IsString, IsUUID } from 'class-validator';

export class ChargePaymentMethodDto {
  @IsUUID()
  paymentMethodId: string;

  @IsInt()
  amountCents: number;

  @IsString()
  currency: string;

  @IsIn(['previous-transaction', 'recurring'])
  strategy: 'previous-transaction' | 'recurring';
}
