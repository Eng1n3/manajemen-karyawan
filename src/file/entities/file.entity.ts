import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'files' })
export class File {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_files',
  })
  id: string;

  @Column({
    name: 'path',
  })
  path: string;

  @Column({
    name: 'original_name',
    type: 'varchar',
    length: 100,
  })
  originalName: string;

  @Column({
    name: 'mime_type',
  })
  mimeType: string;

  @Column({
    type: 'float',
    name: 'size',
  })
  size: number;

  @Column({
    name: 'checksum',
  })
  checksum: string;

  @Column({
    name: 'is_main',
    type: 'boolean',
  })
  isMain: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
