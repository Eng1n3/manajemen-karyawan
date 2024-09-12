import { ConfigService } from '@nestjs/config';
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const configService = new ConfigService()

@Entity({ name: 'files' })
export class File {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_files',
  })
  id: string;

  @Exclude()
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

  @Expose({ name: 'path' })
  get imagePtah(): string {
    return `${configService.get('BASE_URL_APP')}/${this.path}`;
  }

  constructor(partial: Partial<File>) {
    Object.assign(this, partial);
  }
}
