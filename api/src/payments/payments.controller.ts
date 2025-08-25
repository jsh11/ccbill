import { Body, Controller, Headers, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { ChargePaymentMethodDto } from './dto/charge-payment-method.dto';
import { ConfigService } from '@nestjs/config';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Post('payment-methods')
  createPaymentMethod(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentsService.createPaymentMethod(dto);
  }

  @Post('charges')
  chargePaymentMethod(@Body() dto: ChargePaymentMethodDto) {
    return this.paymentsService.chargePaymentMethod(dto);
  }

  @Post('webhooks/ccbill')
  handleWebhook(@Headers('x-webhook-secret') secret: string, @Body() body: any) {
    const expected = this.config.get('WEBHOOK_SECRET');
    if (secret !== expected) {
      return { received: false };
    }
    // In a real implementation, you would update payment records based on the event.
    return { received: true };
  }
}
