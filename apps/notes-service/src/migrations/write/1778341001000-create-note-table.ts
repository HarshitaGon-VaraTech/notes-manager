import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNoteTable1778341001000 implements MigrationInterface {
  name = 'CreateNoteTable1778341001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "note" (
        "id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "categoryId" character varying,
        CONSTRAINT "PK_note_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_note_title" UNIQUE ("title")
      )
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'UQ_note_title'
        ) THEN
          ALTER TABLE "note"
          ADD CONSTRAINT "UQ_note_title" UNIQUE ("title");
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "note"`);
  }
}
