const express           = require('express');
const routes            = express.Router();
const LeituraController = require('../controllers/LeituraController');
const verificarSessao   = require('../middlewares/VerificarSessao');


routes.post('/dados', LeituraController.receberDados.bind(LeituraController));


routes.get('/leituras/ultimas',       verificarSessao, LeituraController.ultimas.bind(LeituraController));
routes.get('/historico',              verificarSessao, LeituraController.historico.bind(LeituraController));
routes.get('/alertas',                verificarSessao, LeituraController.listarAlertas.bind(LeituraController));
routes.patch('/alertas/:id/resolver', verificarSessao, LeituraController.resolverAlerta.bind(LeituraController));

module.exports = routes;