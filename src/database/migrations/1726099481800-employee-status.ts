import { MigrationInterface, QueryRunner } from "typeorm";

export class EmployeeStatus1726099481800 implements MigrationInterface {
    name = 'EmployeeStatus1726099481800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employee_status" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(100) NOT NULL, "description" text NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "employee_status"`);
    }

}
