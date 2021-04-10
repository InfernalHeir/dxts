const env = process.env.NODE_ENV;

const getConfig = () => {

  if (env === "development") {
    return {
      username: "root",
      password: "root",
      database: "mlm",
      host: "127.0.0.1",
      dialect: "mysql",
      operatorsAliases: 0
    };
  } else {
    return {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: '13.232.16.114',
      dialect: "mysql",
      operatorsAliases: 0
    };
  }
};

module.exports = getConfig;