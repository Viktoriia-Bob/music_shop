import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTables1636033100372 implements MigrationInterface {
    name = 'CreateTables1636033100372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "author_skin_tone" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_74c66ae92c9ce53185158753d56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "author_songs" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "skinToneId" integer, CONSTRAINT "PK_ec5387637d24b11379aa568f970" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "genre_songs" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_d0e5fa84bbe1bcf468e37d6bbe8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "song" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" integer NOT NULL DEFAULT '0', "image" character varying NOT NULL DEFAULT 'https://picsum.photos/200', "genreId" integer, "authorId" integer, CONSTRAINT "PK_baaa977f861cce6ff954ccee285" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wishlist" ("id" SERIAL NOT NULL, CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "verify" boolean NOT NULL DEFAULT false, "phoneNumber" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "isBlocked" boolean NOT NULL DEFAULT false, "customerId" character varying NOT NULL, "wishlistId" integer, "cartId" integer, CONSTRAINT "UQ_f2578043e491921209f5dadd080" UNIQUE ("phoneNumber"), CONSTRAINT "REL_9583a1a42eebde5b1c16ee166d" UNIQUE ("wishlistId"), CONSTRAINT "REL_342497b574edb2309ec8c6b62a" UNIQUE ("cartId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_with_songs" ("id" SERIAL NOT NULL, CONSTRAINT "PK_578ac1e6a9f4012182113cb732c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wishlist_list_of_songs_song" ("wishlistId" integer NOT NULL, "songId" integer NOT NULL, CONSTRAINT "PK_0ac6a7c689d4876ada48089befb" PRIMARY KEY ("wishlistId", "songId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_70da4d9c8d710f51ce7caa152d" ON "wishlist_list_of_songs_song" ("wishlistId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e85d4db6a3ca2c9f257749f5ed" ON "wishlist_list_of_songs_song" ("songId") `);
        await queryRunner.query(`CREATE TABLE "boughtSongsId" ("userId" integer NOT NULL, "songId" integer NOT NULL, CONSTRAINT "PK_c2f53f7b08f82f690ad25b70cd0" PRIMARY KEY ("userId", "songId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_33eda6a51b607b89e7d516fb3a" ON "boughtSongsId" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2146a31e09ed677b9737b5872a" ON "boughtSongsId" ("songId") `);
        await queryRunner.query(`CREATE TABLE "cart_with_songs_list_of_songs_song" ("cartWithSongsId" integer NOT NULL, "songId" integer NOT NULL, CONSTRAINT "PK_5adeb02b7eaecbca32f3c76f91f" PRIMARY KEY ("cartWithSongsId", "songId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_73aeebae3468792bcd6b5d1a2f" ON "cart_with_songs_list_of_songs_song" ("cartWithSongsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5e9216f17fe469fc6db270a27" ON "cart_with_songs_list_of_songs_song" ("songId") `);
        await queryRunner.query(`ALTER TABLE "author_songs" ADD CONSTRAINT "FK_b3927ea07b362b8a238635a1b0f" FOREIGN KEY ("skinToneId") REFERENCES "author_skin_tone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "song" ADD CONSTRAINT "FK_d9ffa20e72f9e6834680ead9fe4" FOREIGN KEY ("genreId") REFERENCES "genre_songs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "song" ADD CONSTRAINT "FK_2347b7912d4e51efb37d74f52e3" FOREIGN KEY ("authorId") REFERENCES "author_songs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9583a1a42eebde5b1c16ee166d2" FOREIGN KEY ("wishlistId") REFERENCES "wishlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_342497b574edb2309ec8c6b62aa" FOREIGN KEY ("cartId") REFERENCES "cart_with_songs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist_list_of_songs_song" ADD CONSTRAINT "FK_70da4d9c8d710f51ce7caa152d0" FOREIGN KEY ("wishlistId") REFERENCES "wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "wishlist_list_of_songs_song" ADD CONSTRAINT "FK_e85d4db6a3ca2c9f257749f5ede" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "boughtSongsId" ADD CONSTRAINT "FK_33eda6a51b607b89e7d516fb3a0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "boughtSongsId" ADD CONSTRAINT "FK_2146a31e09ed677b9737b5872a0" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cart_with_songs_list_of_songs_song" ADD CONSTRAINT "FK_73aeebae3468792bcd6b5d1a2f2" FOREIGN KEY ("cartWithSongsId") REFERENCES "cart_with_songs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cart_with_songs_list_of_songs_song" ADD CONSTRAINT "FK_c5e9216f17fe469fc6db270a27c" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_with_songs_list_of_songs_song" DROP CONSTRAINT "FK_c5e9216f17fe469fc6db270a27c"`);
        await queryRunner.query(`ALTER TABLE "cart_with_songs_list_of_songs_song" DROP CONSTRAINT "FK_73aeebae3468792bcd6b5d1a2f2"`);
        await queryRunner.query(`ALTER TABLE "boughtSongsId" DROP CONSTRAINT "FK_2146a31e09ed677b9737b5872a0"`);
        await queryRunner.query(`ALTER TABLE "boughtSongsId" DROP CONSTRAINT "FK_33eda6a51b607b89e7d516fb3a0"`);
        await queryRunner.query(`ALTER TABLE "wishlist_list_of_songs_song" DROP CONSTRAINT "FK_e85d4db6a3ca2c9f257749f5ede"`);
        await queryRunner.query(`ALTER TABLE "wishlist_list_of_songs_song" DROP CONSTRAINT "FK_70da4d9c8d710f51ce7caa152d0"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_342497b574edb2309ec8c6b62aa"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9583a1a42eebde5b1c16ee166d2"`);
        await queryRunner.query(`ALTER TABLE "song" DROP CONSTRAINT "FK_2347b7912d4e51efb37d74f52e3"`);
        await queryRunner.query(`ALTER TABLE "song" DROP CONSTRAINT "FK_d9ffa20e72f9e6834680ead9fe4"`);
        await queryRunner.query(`ALTER TABLE "author_songs" DROP CONSTRAINT "FK_b3927ea07b362b8a238635a1b0f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5e9216f17fe469fc6db270a27"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_73aeebae3468792bcd6b5d1a2f"`);
        await queryRunner.query(`DROP TABLE "cart_with_songs_list_of_songs_song"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2146a31e09ed677b9737b5872a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_33eda6a51b607b89e7d516fb3a"`);
        await queryRunner.query(`DROP TABLE "boughtSongsId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e85d4db6a3ca2c9f257749f5ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70da4d9c8d710f51ce7caa152d"`);
        await queryRunner.query(`DROP TABLE "wishlist_list_of_songs_song"`);
        await queryRunner.query(`DROP TABLE "cart_with_songs"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "wishlist"`);
        await queryRunner.query(`DROP TABLE "song"`);
        await queryRunner.query(`DROP TABLE "genre_songs"`);
        await queryRunner.query(`DROP TABLE "author_songs"`);
        await queryRunner.query(`DROP TABLE "author_skin_tone"`);
    }

}
