const { Client } = require("pg");

const connectionString =
  "postgresql://postgres:070202@localhost:5432/Nongsan_DATN";

const client = new Client({
  connectionString: connectionString,
});

client
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Connection error", err));

module.exports = client;
