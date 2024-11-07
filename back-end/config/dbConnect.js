const { Client } = require("pg");

const connectionString =
  "postgresql://postgres:hung123dac@localhost:5432/Nongsan";

const client = new Client({
  connectionString: connectionString,
});

client
  .connect()
  .then(() => console.log("Connected to the database successfully👀"))
  .catch((err) => console.error("Connection error", err));

module.exports = client;
