import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { Charge } from './entities/charge.entity';
import { CcBillService } from '../ccbill/ccbill.service';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { ChargePaymentMethodDto } from './dto/charge-payment-method.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(Charge)
    private readonly chargeRepo: Repository<Charge>,
    private readonly ccBill: CcBillService,
    private readonly config: ConfigService,
  ) {}

  private centsToAmount(cents: number): number {
    return cents / 100;
  }

  async createPaymentMethod(dto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const tokenData = await this.ccBill.createPaymentToken({
      clientAccnum: this.config.get('CCBILL_CLIENT_ACCNUM'),
      subacc: this.config.get('CCBILL_SUBACC_TOKEN'),
      paymentAccountNumber: dto.cardNumber,
      expiryMonth: dto.expMonth,
      expiryYear: dto.expYear,
      cvv2: dto.cvv,
      customerIpAddress: dto.customerIP,
    });

    const paymentMethod = this.paymentMethodRepo.create({
      userId: dto.userId,
      last4: dto.cardNumber.slice(-4),
      expMonth: dto.expMonth,
      expYear: dto.expYear,
    });
    await this.paymentMethodRepo.save(paymentMethod);

    if (dto.amountCents) {
      const subacc = dto.recurring
        ? this.config.get('CCBILL_SUBACC_RECURRING')
        : this.config.get('CCBILL_SUBACC_NONRECUR');
      const chargeData = await this.ccBill.chargePaymentToken(
        tokenData.paymentToken,
        {
          clientAccnum: this.config.get('CCBILL_CLIENT_ACCNUM'),
          subacc,
          initialPrice: this.centsToAmount(dto.amountCents),
          currencyCode: dto.currency || 'EUR',
          customerIpAddress: dto.customerIP,
        },
      );
      paymentMethod.ccbillLastTransactionId = chargeData.transactionId;
      await this.paymentMethodRepo.save(paymentMethod);
      const charge = this.chargedFromResponse(paymentMethod, dto.amountCents, dto.currency || 'EUR', chargeData);
      await this.chargeRepo.save(charge);
    }

    return paymentMethod;
  }

  private chargedFromResponse(
    paymentMethod: PaymentMethod,
    amountCents: number,
    currency: string,
    response: any,
  ): Charge {
    return this.chargeRepo.create({
      paymentMethodId: paymentMethod.id,
      userId: paymentMethod.userId,
      amountCents,
      currency,
      ccbillTransactionId: response.transactionId,
      status: 'succeeded',
      rawResponse: response,
    });
  }

  async chargePaymentMethod(dto: ChargePaymentMethodDto): Promise<Charge> {
    const paymentMethod = await this.paymentMethodRepo.findOneBy({ id: dto.paymentMethodId });
    if (!paymentMethod || !paymentMethod.ccbillLastTransactionId) {
      throw new NotFoundException('Payment method not found or no transaction history');
    }

    const chargeResp = await this.ccBill.chargeByPreviousTransactionId(
      paymentMethod.ccbillLastTransactionId,
      {
        clientAccnum: this.config.get('CCBILL_CLIENT_ACCNUM'),
        initialPrice: this.centsToAmount(dto.amountCents),
        currencyCode: dto.currency,
      },
    );

    paymentMethod.ccbillLastTransactionId = chargeResp.transactionId;
    await this.paymentMethodRepo.save(paymentMethod);

    const charge = this.chargedFromResponse(
      paymentMethod,
      dto.amountCents,
      dto.currency,
      chargeResp,
    );
    await this.chargeRepo.save(charge);
    return charge;
  }
}
