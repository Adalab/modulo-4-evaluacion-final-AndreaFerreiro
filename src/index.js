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
      host: process.env.DB_HOST || "sql.freedb.tech",
      user: process.env.DB_USER || "freedb_AndreaFerreiro",
      password: process.env.DB_PASS, 
      database: process.env.DB_NAME || "freedb_recetas_DB",
    }
  );
  connection.connect();
  return connection;
}
const port = process.env.PORT || 4500;
server.listen(port, () => {
  console.log(`Ya se ha arrancado nuestro servidor: http://localhost:${port}/`);
});
server.get ('/api/recetas', async (req,res) => {
  const select = 'SELECT * FROM recetas';
  const conn = await getConnection();
  const [results] = await conn.query(select);
  res.json({
      "info": { "count": results.length},
      "results": results 
   });
})