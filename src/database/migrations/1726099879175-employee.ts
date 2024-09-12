import { MigrationInterface, QueryRunner } from "typeorm";

export class Employee1726099879175 implements MigrationInterface {
    name = 'Employee1726099879175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employees" ("id" varchar PRIMARY KEY NOT NULL, "employee_status_id" varchar NOT NULL, "name" varchar(100) NOT NULL, "employee_number" integer NOT NULL, "position" varchar(100) NOT NULL, "department" varchar NOT NULL, "entry_date" date NOT NULL, "photo" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime)`);
        await queryRunner.query(`CREATE TABLE "temporary_employees" ("id" varchar PRIMARY KEY NOT NULL, "employee_status_id" varchar NOT NULL, "name" varchar(100) NOT NULL, "employee_number" integer NOT NULL, "position" varchar(100) NOT NULL, "department" varchar NOT NULL, "entry_date" date NOT NULL, "photo" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, CONSTRAINT "FK_employees_employee_status" FOREIGN KEY ("employee_status_id") REFERENCES "employee_status" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_employees"("id", "employee_status_id", "name", "employee_number", "position", "department", "entry_date", "photo", "created_at", "updated_at", "deleted_at") SELECT "id", "employee_status_id", "name", "employee_number", "position", "department", "entry_date", "photo", "created_at", "updated_at", "deleted_at" FROM "employees"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`ALTER TABLE "temporary_employees" RENAME TO "employees"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" RENAME TO "temporary_employees"`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" varchar PRIMARY KEY NOT NULL, "employee_status_id" varchar NOT NULL, "name" varchar(100) NOT NULL, "employee_number" integer NOT NULL, "position" varchar(100) NOT NULL, "department" varchar NOT NULL, "entry_date" date NOT NULL, "photo" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime)`);
        await queryRunner.query(`INSERT INTO "employees"("id", "employee_status_id", "name", "employee_number", "position", "department", "entry_date", "photo", "created_at", "updated_at", "deleted_at") SELECT "id", "employee_status_id", "name", "employee_number", "position", "department", "entry_date", "photo", "created_at", "updated_at", "deleted_at" FROM "temporary_employees"`);
        await queryRunner.query(`DROP TABLE "temporary_employees"`);
        await queryRunner.query(`DROP TABLE "employees"`);
    }

}
