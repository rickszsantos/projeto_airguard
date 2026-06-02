const express            = require('express');
const router             = express.Router();
const EstacaoController  = require('../controllers/EstacaoController');

router.get('/estacoes',              EstacaoController.listarEstacoes.bind(EstacaoController));
router.patch('/estacoes/:id/status', EstacaoController.atualizarStatus.bind(EstacaoController));

module.exports = router;