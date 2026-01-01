import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSocketId1767263298966 implements MigrationInterface {
    name = 'AddSocketId1767263298966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_5a71643cec3110af425f92e76e5\``);
        await queryRunner.query(`ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_5a71643cec3110af425f92e76e5\` FOREIGN KEY (\`following_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_5a71643cec3110af425f92e76e5\``);
        await queryRunner.query(`ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_5a71643cec3110af425f92e76e5\` FOREIGN KEY (\`following_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
