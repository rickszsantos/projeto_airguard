const express = require("express");
const routes = express.Router();
const LeituraController = require("../controllers/LeituraController");


routes.post("/dados", LeituraController.receberDados);

routes.get("/dados", LeituraController.listarDados)






module.exports = routes;