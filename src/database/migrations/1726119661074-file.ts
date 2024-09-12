import { MigrationInterface, QueryRunner } from "typeorm";

export class File1726119661074 implements MigrationInterface {
    name = 'File1726119661074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_files" ("id" varchar PRIMARY KEY NOT NULL, "path" varchar NOT NULL, "original_name" varchar(100) NOT NULL, "mime_type" varchar NOT NULL, "size" float NOT NULL, "is_main" boolean NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime)`);
        await queryRunner.query(`INSERT INTO "temporary_files"("id", "path", "original_name", "mime_type", "size", "is_main", "created_at", "updated_at", "deleted_at") SELECT "id", "path", "original_name", "mime_type", "size", "is_main", "created_at", "updated_at", "deleted_at" FROM "files"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`ALTER TABLE "temporary_files" RENAME TO "files"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" RENAME TO "temporary_files"`);
        await queryRunner.query(`CREATE TABLE "files" ("id" varchar PRIMARY KEY NOT NULL, "path" varchar NOT NULL, "original_name" varchar(100) NOT NULL, "mime_type" varchar NOT NULL, "size" float NOT NULL, "checksum" varchar NOT NULL, "is_main" boolean NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime)`);
        await queryRunner.query(`INSERT INTO "files"("id", "path", "original_name", "mime_type", "size", "is_main", "created_at", "updated_at", "deleted_at") SELECT "id", "path", "original_name", "mime_type", "size", "is_main", "created_at", "updated_at", "deleted_at" FROM "temporary_files"`);
        await queryRunner.query(`DROP TABLE "temporary_files"`);
    }

}
