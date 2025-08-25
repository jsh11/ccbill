import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PaymentMethod } from './payment-method.entity';

@Entity('charges')
export class Charge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, (pm) => pm.charges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @Column()
  userId: string;

  @Column('int')
  amountCents: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column()
  ccbillTransactionId: string;

  @Column()
  status: 'succeeded' | 'failed';

  @Column({ type: 'jsonb', nullable: true })
  rawResponse?: any;

  @CreateDateColumn()
  createdAt: Date;
}
