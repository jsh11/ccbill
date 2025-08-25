import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Charge } from './charge.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  brand?: string;

  @Column({ nullable: true })
  last4?: string;

  @Column({ type: 'int', nullable: true })
  expMonth?: number;

  @Column({ type: 'int', nullable: true })
  expYear?: number;

  @Column({ nullable: true })
  ccbillLastTransactionId?: string;

  @Column({ default: false })
  isRecurringDefault: boolean;

  @OneToMany(() => Charge, (charge) => charge.paymentMethod)
  charges: Charge[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
