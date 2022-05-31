// 默认标准配置，完全sequelize参数，不需要.env
module.exports = {
  driver: "mysql",
  options: {
    mysql: [
      "default_db",
      "root",
      "root",
      {
        host: "localhost",
        port: 3306,
        dialect: "mysql",
      },
    ],
    postgres: [
      "default_db",
      "postgres",
      "password",
      {
        host: "localhost",
        port: 2345,
        dialect: "postgres",
      },
    ],
    sqlite: [
      {
        dialect: "sqlite",
        storage: require("path").resolve("dbfile", "sqlite.db"),
      },
    ],
  },
};
