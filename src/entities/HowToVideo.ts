import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'how_to_video' })
export class HowToVideo {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'uploader_user_id', type: 'bigint', unsigned: true })
  uploaderUserId!: number;

  @Column({ name: 'provider', length: 50, default: 's3' })
  provider!: string;

  @Column({ name: 'video_url', length: 1024 })
  videoUrl!: string;

  @Column({ name: 'thumbnail_url', length: 1024, nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'duration_seconds', type: 'int', unsigned: true, nullable: true })
  durationSeconds?: number;

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status!: 'draft' | 'published' | 'archived';

  @Column({ name: 'is_protected', type: 'tinyint', width: 1, default: 0 })
  isProtected!: boolean;

  @Column({ name: 'password_hash',  type: 'varchar' , length: 255, nullable: true })
  passwordHash?: string | null;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ name: 'views_count', type: 'bigint', default: 0 })
  viewsCount!: number;

  @Column({ name: 'likes_count', type: 'bigint', default: 0 })
  likesCount!: number;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }
}
