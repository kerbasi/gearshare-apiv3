import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Part } from './part.entity';
import { VehicleModel } from './vehicle-model.entity';

@Entity('part_vehicle_compatibility')
@Unique(['partId', 'vehicleModelId'])
export class PartVehicleCompatibility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  partId: string;

  @ManyToOne(() => Part, part => part.partCompatibilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partId' })
  part: Part;

  @Column({ type: 'uuid' })
  vehicleModelId: string;

  @ManyToOne(() => VehicleModel, vehicleModel => vehicleModel.partCompatibilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleModelId' })
  vehicleModel: VehicleModel;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
