const env = "development";

const getConfig = () => {
  if (env === "development") {
    return {
      username: "root",
      password: "root",
      database: "mlm",
      host: "127.0.0.1",
      dialect: "mysql",
      operatorsAliases: 0,
    };
  } else {
    return {
      username: root,
      password: root,
      database: "mlm",
      host: "13.126.63.235",
      dialect: "mysql",
      operatorsAliases: 0,
    };
  }
};

module.exports = getConfig;
