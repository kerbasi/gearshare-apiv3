import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PartVehicleCompatibility } from './part-vehicle-compatibility.entity';

@Entity('vehicle_models')
export class VehicleModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  make: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'int' })
  yearStart: number;

  @Column({ type: 'int', nullable: true })
  yearEnd: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  engineType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  engineSize: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fuelType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transmissionType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bodyType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PartVehicleCompatibility, compatibility => compatibility.vehicleModel)
  partCompatibilities: PartVehicleCompatibility[];
}
