const express           = require('express');
const router            = express.Router();
const EstacaoController = require('../controllers/EstacaoController');
const verificarSessao   = require('../middlewares/VerificarSessao');
const { verPermissao, verSenhaAdmin } = require('../middlewares/VerificarPermissao');

// Qualquer logado pode listar
router.get('/estacoes', verificarSessao, EstacaoController.listarEstacoes.bind(EstacaoController));

// Admin ou superior para criar/editar/status/intervalo
router.post  ('/estacoes',                    verificarSessao, verPermissao('estacao:criar'),    EstacaoController.criarEstacao.bind(EstacaoController));
router.put   ('/estacoes/:id',                verificarSessao, verPermissao('estacao:editar'),   EstacaoController.editarEstacao.bind(EstacaoController));
router.patch ('/estacoes/:id/status',         verificarSessao, verPermissao('estacao:status'),   EstacaoController.atualizarStatus.bind(EstacaoController));
router.patch ('/estacoes/:id/intervalo',      verificarSessao, verPermissao('estacao:intervalo'),EstacaoController.atualizarIntervalo.bind(EstacaoController));

// Só superadmin (verifica senha no body)
router.delete('/estacoes/:id',                verificarSessao, verPermissao('estacao:excluir'), EstacaoController.excluirEstacao.bind(EstacaoController));

module.exports = router;