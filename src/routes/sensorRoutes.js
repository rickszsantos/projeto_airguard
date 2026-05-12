const express = require("express");
const routes = express.Router();
const sensorController = require("../controllers/sensorController");


routes.post("/dados", sensorController.receberDados);

routes.get("/dados", sensorController.listarDados)






module.exports = routes;