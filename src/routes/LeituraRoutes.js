const express = require("express");
const routes = express.Router();
const LeituraController = require("../controllers/LeituraController");


routes.post("/dados", LeituraController.receberDados);








module.exports = routes;