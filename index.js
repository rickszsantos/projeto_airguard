const express = require("express");
const app = express(); // "init"
require('dotenv').config();
const authRoutes = require("./src/routes/authRoutes");
const sensorRoutes = require("./src/routes/sensorRoutes");

//renderizar as telas e carregar a pasta de viws
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));
app.use("/", authRoutes);
app.use("/api", sensorRoutes);












app.listen(3000, () => {
  console.log("Servidor rodando");
});