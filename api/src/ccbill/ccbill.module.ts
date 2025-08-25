import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CcBillService } from './ccbill.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [CcBillService],
  exports: [CcBillService],
})
export class CcBillModule {}
