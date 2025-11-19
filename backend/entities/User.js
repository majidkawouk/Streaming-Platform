import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "User",
  tableName: "users",

  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    username: {
      type: "varchar",
      unique: true,
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
    },
    created_at: {
      type: "datetime",
      createDate: true,
    },
  },

  relations: {
    streams: {
      type: "one-to-many",
      target: "Stream",
      inverseSide: "user",
    },

    following: {
      type: "many-to-many",
      target: "User",
      joinTable: {
        name: "user_follows",
        joinColumn: { name: "follower_id" },
        inverseJoinColumn: { name: "following_id" },
      },
      inverseSide: "followers",
    },

    followers: {
      type: "many-to-many",
      target: "User",
      joinTable: {
        name: "user_follows",
        joinColumn: { name: "following_id" },
        inverseJoinColumn: { name: "follower_id" },
      },
    },
  },
});
