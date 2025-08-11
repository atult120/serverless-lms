import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHowToVideoTable1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'how_to_video',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'uuid',
            type: 'char',
            length: '36',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'uploader_user_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            default: `'s3'`,
          },
          {
            name: 'video_url',
            type: 'varchar',
            length: '1024',
          },
          {
            name: 'thumbnail_url',
            type: 'varchar',
            length: '1024',
            isNullable: true,
          },
          {
            name: 'duration_seconds',
            type: 'int',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published', 'archived'],
            default: `'draft'`,
          },
          {
            name: 'is_protected',
            type: 'tinyint',
            width: 1,
            default: 0,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'views_count',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'likes_count',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('how_to_video');
  }
}
