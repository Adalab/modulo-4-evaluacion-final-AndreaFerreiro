const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require('dotenv').config();
const server = express();
server.use(cors());
server.use(express.json({limit: "25mb"}));
server.set('view engine', 'ejs');
const jwt = require('jsonwebtoken'); 
const bcrypt = require("bcrypt");
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
server.get ('/recetas', async (req,res) => {
  const select = 'SELECT * FROM recetas';
  const conn = await getConnection();
  const [results] = await conn.query(select);
  conn.end();
  res.json({
      "info": { "count": results.length},
      "results": results 
   });
});
server.get ('/recetas/:id', async (req,res) => {
  const idRecipe = req.params.id;
  const select = 'SELECT * FROM recetas WHERE id = ?';
  const conn = await getConnection();
  const [results] = await conn.query(select, idRecipe);
  res.json(results[0]);
});
server.post ('/recetas', async (req,res) => {
  const newRecipe = req.body;
  try{
    const insert = 'INSERT INTO recetas (nombre, ingredientes, instrucciones) VALUES (?,?,?)';
    const conn =await getConnection();
    const [results] = await conn.query(insert, [newRecipe.nombre, newRecipe.ingredientes, newRecipe.instrucciones]);
    conn.end();
    console.log(results);
    res.json({
      success: true,
      id: results.insertId
    })
  }
  catch(error){
    console.log(error);
    res.json({
      success: false,
      message: 'No se ha podido añadir la receta'
    })
  }
});
server.put ('/recetas/:id', async (req, res) => {
  const idRecipe= req.params.id;
  const {nombre, ingredientes, instrucciones} = req.body;
  try{
    const update = 'UPDATE recetas SET nombre = ?, ingredientes = ?, instrucciones = ? WHERE id = ?';
    const conn =await getConnection();
    const [results] = await conn.query(update, [nombre, ingredientes, instrucciones, idRecipe]);
    conn.end();
    res.json({
      success: true,
    })
  }
  catch(error){
    res.json({
      success: false,
      message: error
    })
  }
});
server.delete('/recetas/:id', async (req, res) => {
  const idRecipe = req.params.id;
  try{
    const sql = 'DELETE FROM recetas WHERE id = ?';
    const conn = await getConnection();
    const [results] = await conn.query(sql, idRecipe);
    conn.end();
    res.json({
      success:true,
      id: idRecipe
    })
  }
  catch(error){
    res.json({
      success:false,
      message: "Ha ocurrido un error"
    })
  }
});
server.post('/registro' , async (req,res) => {
  const username = req.body.nombre;
  const email = req.body.email;
  const password = req.body.password;
  const passwordHash = await bcrypt.hash(password, 10)
  try{
    const sql = "INSERT INTO usuarios (nombre,email,password) VALUES (?,?,?)";
    const connection = await getConnection();
    const [results,] = await connection.query(sql,[username,email,passwordHash]);
    connection.end();
    res.json({
      success: true, 
      token: passwordHash, 
      id:results.insertId
    })
  }
  catch(error){
    res.json({
      success: false,
      message: error
    })
  }
});
server.post ('/login', async (req,res)=> {
  const user = req.body;
  const select = 'SELECT * FROM usuarios WHERE email= ?';
  const conn = await getConnection();
  const [results] = await conn.query(select, user.email);
  conn.end();
  if(results.length !== 1){
    res.json({
      success: false,
      error: 'El email o contraseña no son correctos'
    })
    return
  }
  if (!await bcrypt.compare(user.password, results[0].password)){
    res.json({
      success: false,
      error: 'El email o contraseña no son correctos'
    })
    return
  }
  res.json({
    success: true
  })
})