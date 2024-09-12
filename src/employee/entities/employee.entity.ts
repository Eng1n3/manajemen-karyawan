import { Exclude, Expose } from 'class-transformer';
import { EmployeeStatus } from 'src/employee-status/entities/employee-status.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_employees',
  })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'employee_number', type: 'int' })
  employeeNumber: number;

  @Column({ type: 'varchar', length: 100 })
  position: string;

  @Column({ type: 'varchar' })
  department: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({ type: 'varchar' })
  photo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
