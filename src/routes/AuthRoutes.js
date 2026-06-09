const express = require('express');
const routes  = express.Router();
const AuthController  = require('../controllers/AuthController');
const validarCadastro = require('../validators/AuthValidator');
const verificarSessao = require('../middlewares/VerificarSessao');
const { verPermissao } = require('../middlewares/VerificarPermissao');






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





routes.put('/api/me/perfil', verificarSessao, AuthController.atualizarMeuPerfil.bind(AuthController));
routes.put('/api/me/senha',  verificarSessao, AuthController.atualizarMinhaSenha.bind(AuthController));



routes.get   ('/api/usuarios',             verificarSessao, verPermissao('usuario:editar'),        AuthController.listarUsuarios.bind(AuthController));
routes.patch ('/api/usuarios/:id/perfil',  verificarSessao, verPermissao('usuario:alterarPerfil'), AuthController.alterarPerfilUsuario.bind(AuthController));
routes.patch ('/api/usuarios/:id/status',  verificarSessao, verPermissao('usuario:editar'),        AuthController.alterarStatusUsuario.bind(AuthController));
routes.delete('/api/usuarios/:id',         verificarSessao, verPermissao('usuario:excluir'),       AuthController.excluirUsuario.bind(AuthController));


routes.get('/api/logs', verificarSessao, verPermissao('usuario:editar'), AuthController.listarLogs.bind(AuthController));

routes.get('/', (req, res) => res.redirect('/login'));


module.exports = routes;
