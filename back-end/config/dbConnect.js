const { Client } = require('pg');

const connectionString = "postgres://postgres:070202@localhost:5432/database";
const client = new Client({
  connectionString: connectionString,
});

client
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Connection error", err));

module.exports = client;