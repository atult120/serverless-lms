import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUsersTable1680000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "users",
      columns: [
        { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment", unsigned: true },
        { name: "uuid", type: "char", length: "36", isUnique: true, isNullable: false },
        { name: "email", type: "varchar", length: "255", isNullable: false, isUnique: true },
        { name: "name", type: "varchar", length: "255", isNullable: false },
        { name: "role", type: "enum", enum: ["admin", "instructor", "student", "manager"], default: "'student'" },
        { name: "cognito_sub", type: "varchar", length: "255", isNullable: true },
        { name: "is_active", type: "tinyint", width: 1, default: 1 },
        { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" },
        { name: "deleted_at", type: "timestamp", isNullable: true }
      ]
    }), true);

    await queryRunner.createIndex("users", new TableIndex({ name: "idx_users_email", columnNames: ["email"] }));
    await queryRunner.createIndex("users", new TableIndex({ name: "idx_users_uuid", columnNames: ["uuid"] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("users", "idx_users_email");
    await queryRunner.dropIndex("users", "idx_users_uuid");
    await queryRunner.dropTable("users");
  }
}
