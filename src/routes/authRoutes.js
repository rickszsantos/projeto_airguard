const express = require("express");
const routes = express.Router();
const AuthController = require("../controllers/authController");



routes.get("/", AuthController.showLogin);

routes.get("/home", AuthController.showHome);

routes.get("/cadastro", AuthController.showCadastro);

routes.post("/login", AuthController.login);







module.exports = routes;
