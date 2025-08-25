import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from './entities/payment-method.entity';
import { Charge } from './entities/charge.entity';
import { CcBillModule } from '../ccbill/ccbill.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, Charge]), CcBillModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
