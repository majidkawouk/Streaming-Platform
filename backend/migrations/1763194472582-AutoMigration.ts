import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1763194472582 implements MigrationInterface {
    name = 'AutoMigration1763194472582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`streams\` DROP FOREIGN KEY \`FK_77aa47d299ba9614c154bfca96a\``);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`category\` \`category\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`thumbnail_url\` \`thumbnail_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`started_at\` \`started_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`ended_at\` \`ended_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`streams\` ADD CONSTRAINT \`FK_77aa47d299ba9614c154bfca96a\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`streams\` DROP FOREIGN KEY \`FK_77aa47d299ba9614c154bfca96a\``);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`ended_at\` \`ended_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`started_at\` \`started_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`thumbnail_url\` \`thumbnail_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`streams\` CHANGE \`category\` \`category\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`streams\` ADD CONSTRAINT \`FK_77aa47d299ba9614c154bfca96a\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
