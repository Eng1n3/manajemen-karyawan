import { MigrationInterface, QueryRunner } from "typeorm";

export class Employee1726113782468 implements MigrationInterface {
    name = 'Employee1726113782468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employees" ("id" varchar PRIMARY KEY NOT NULL, "status" varchar(100) NOT NULL, "name" varchar(100) NOT NULL, "employee_number" integer NOT NULL, "position" varchar(100) NOT NULL, "department" varchar NOT NULL, "entry_date" date NOT NULL, "photo" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "employees"`);
    }

}
