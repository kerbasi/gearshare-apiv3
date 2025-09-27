import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { Category } from './category.entity';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { InventoryTransaction } from './inventory-transaction.entity';
import { PartVehicleCompatibility } from './part-vehicle-compatibility.entity';

@Entity('parts')
export class Part {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  partNumber: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  manufacturerId: string;

  @ManyToOne(() => Manufacturer, manufacturer => manufacturer.parts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'manufacturerId' })
  manufacturer: Manufacturer;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, category => category.parts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  weight: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', default: 0 })
  minStockLevel: number;

  @Column({ type: 'int', nullable: true })
  maxStockLevel: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.part)
  orderItems: OrderItem[];

  @OneToMany(() => InventoryTransaction, transaction => transaction.part)
  inventoryTransactions: InventoryTransaction[];

  @OneToMany(() => PartVehicleCompatibility, compatibility => compatibility.part)
  partCompatibilities: PartVehicleCompatibility[];
}
