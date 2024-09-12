import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'seeders' })
export class SeederEntity {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: 'pk_seeders'})
  id: number;

  @Column('int8')
  timestamp: number;

  @Column('varchar')
  name: string;
}
