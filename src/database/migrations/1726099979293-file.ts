import { MigrationInterface, QueryRunner } from "typeorm";

export class File1726099979293 implements MigrationInterface {
    name = 'File1726099979293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "files" ("id" varchar PRIMARY KEY NOT NULL, "path" varchar NOT NULL, "original_name" varchar(100) NOT NULL, "mime_type" varchar NOT NULL, "size" float NOT NULL, "checksum" varchar NOT NULL, "is_main" boolean NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "files"`);
    }

}
