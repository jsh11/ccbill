import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';
import { CcBillModule } from './ccbill/ccbill.module';
import { PaymentMethod } from './payments/entities/payment-method.entity';
import { Charge } from './payments/entities/charge.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [PaymentMethod, Charge],
        synchronize: true,
      }),
    }),
    PaymentsModule,
    CcBillModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
