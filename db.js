const Pool = require("pg").Pool;

let config = {
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5433,
};

const db = new Pool(config);

module.exports = db;
