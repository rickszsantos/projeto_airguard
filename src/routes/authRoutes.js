const express = require("express");
const routes = express.Router();
const AuthController = require("../controllers/authController");




routes.get("/", AuthController.showLogin);

routes.get("/home", AuthController.showHome);

routes.get("/cadastro", AuthController.showCadastro);

routes.get("/recuperar-senha", AuthController.showRecuperarSenha);

routes.get("/login", AuthController.showLogin);


routes.post("/cadastro", AuthController.cadastro);

routes.post("/login", AuthController.login);






module.exports = routes;
