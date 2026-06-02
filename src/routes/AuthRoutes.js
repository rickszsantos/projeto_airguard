const express = require("express");
const routes = express.Router();
const AuthController = require("../controllers/AuthController");
const validarCadastro  = require('../validators/AuthValidator');  
const verificarSessao  = require('../middlewares/VerificarSessao'); 


routes.get("/login", AuthController.showLogin);

routes.get("/cadastro", AuthController.showCadastro);

routes.get("/recuperar-senha", AuthController.showRecuperarSenha);

routes.get('/configuracoes', verificarSessao, AuthController.showConfiguracoes.bind(AuthController));



routes.post('/cadastro', validarCadastro, AuthController.cadastro.bind(AuthController));

routes.post('/login',    AuthController.login.bind(AuthController));


routes.post('/logout', AuthController.logout.bind(AuthController));


//protegidas
routes.get('/home', verificarSessao, AuthController.showHome.bind(AuthController));

routes.get('/historico', verificarSessao,AuthController.showHistorico.bind(AuthController));

routes.get('/sensores', verificarSessao, AuthController.showSensores.bind(AuthController));

routes.get('/', (req, res) => res.redirect('/login'));



module.exports = routes;
