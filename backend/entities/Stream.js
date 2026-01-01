import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Stream",
  tableName: "streams",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    title: {
      type: "varchar",
    },
    category: {
      type: "varchar",
      nullable: true,
    },
    thumbnail_url: {
      type: "varchar",
      nullable: true,
    },
      socket_id: {
      type: "varchar",
      nullable: true,
      unique: true,
    },
    is_live: {
      type: "boolean",
      default: false,
    },
    stream_key: {
      type: "varchar",
      unique: true,
    },
    started_at: {
      type: "datetime",
      nullable: true,
    },
    ended_at: {
      type: "datetime",
      nullable: true,
    },
    description: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});
