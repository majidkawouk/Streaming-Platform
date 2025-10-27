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
  },
});
