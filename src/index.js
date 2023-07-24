const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require('dotenv').config();
const server = express();
server.use(cors());
server.use(express.json({limit: "25mb"}));
server.set('view engine', 'ejs');

async function getConnection() {
  const connection = await mysql.createConnection(
    {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS, 
      database: process.env.DB_NAME || "Clase",
    }
  );
  connection.connect();
  return connection;
}
const port = process.env.PORT || 4500;
server.listen(port, () => {
  console.log(`Ya se ha arrancado nuestro servidor: http://localhost:${port}/`);
});
