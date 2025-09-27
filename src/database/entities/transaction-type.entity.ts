import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { InventoryTransaction } from './inventory-transaction.entity';

@Entity('transaction_types')
export class TransactionType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 10 })
  direction: 'in' | 'out' | 'neutral';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => InventoryTransaction, transaction => transaction.transactionType)
  transactions: InventoryTransaction[];
}
