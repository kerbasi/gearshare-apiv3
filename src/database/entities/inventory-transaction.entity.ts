import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Part } from './part.entity';
import { TransactionType } from './transaction-type.entity';
import { User } from './user.entity';

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  partId: string;

  @ManyToOne(() => Part, part => part.inventoryTransactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partId' })
  part: Part;

  @Column({ type: 'uuid' })
  transactionTypeId: string;

  @ManyToOne(() => TransactionType, transactionType => transactionType.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transactionTypeId' })
  transactionType: TransactionType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceType: string;

  @Column({ type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
