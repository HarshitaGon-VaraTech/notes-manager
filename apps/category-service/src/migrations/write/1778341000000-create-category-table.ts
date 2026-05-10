import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryTable1778341000000 implements MigrationInterface {
  name = 'CreateCategoryTable1778341000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "category" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "PK_category_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_category_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'UQ_category_name'
        ) THEN
          ALTER TABLE "category"
          ADD CONSTRAINT "UQ_category_name" UNIQUE ("name");
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "category"`);
  }
}
