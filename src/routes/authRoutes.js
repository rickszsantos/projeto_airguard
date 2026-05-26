const express = require("express");
const routes = express.Router();
const AuthController = require("../controllers/authController");
const validarCadastro  = require('../validators/authValidator');  
const verificarSessao  = require('../middlewares/verificarSessao'); 


routes.get("/login", AuthController.showLogin);

routes.get("/cadastro", AuthController.showCadastro);

routes.get("/recuperar-senha", AuthController.showRecuperarSenha);




routes.post('/cadastro', validarCadastro, AuthController.cadastro.bind(AuthController));

routes.post('/login',    AuthController.login.bind(AuthController));


routes.post('/logout', AuthController.logout.bind(AuthController));


//protegidas
routes.get('/home', verificarSessao, AuthController.showHome);
routes.get('/', (req, res) => res.redirect('/login'));



module.exports = routes;
