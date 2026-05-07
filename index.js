const express = require("express");
const app = express(); // "init"

//renderizar as telas e carregar a pasta de viws
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(express.static("public"));

require('dotenv').config();


const authRoutes = require("./src/routes/authRoutes");

//arquivos de rotas
app.get("/", authRoutes);


//====================================================







app.listen(3000, () => {
  console.log("Servidor rodando");
});