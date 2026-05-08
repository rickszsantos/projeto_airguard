const express = require("express");
const routes = express.Router();
const sensorController = require("../controllers/sensorController");


routes.post("/leitura", sensorController.receber_leitura);






module.exports = routes;