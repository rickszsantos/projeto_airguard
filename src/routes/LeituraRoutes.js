const express           = require('express');
const routes            = express.Router();
const LeituraController = require('../controllers/LeituraController');

routes.post('/dados',              LeituraController.receberDados.bind(LeituraController));
routes.get('/leituras/historico',  LeituraController.listarHistorico.bind(LeituraController));
routes.get('/leituras/ultima',     LeituraController.ultimaLeitura.bind(LeituraController));

module.exports = routes;