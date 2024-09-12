import { MigrationInterface, QueryRunner } from "typeorm";

export class Seeder1726099196917 implements MigrationInterface {
    name = 'Seeder1726099196917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "seeders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "timestamp" int8 NOT NULL, "name" varchar NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "seeders"`);
    }

}
