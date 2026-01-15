import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoUrlToStreams1767603009830 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`streams\` ADD \`video_url\` varchar(500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`streams\` DROP COLUMN \`video_url\``);
    }

}