const Estacao = require("../models/Estacao");



class EstacaoController {





listarEstacoes(req, res) {


    const estacao = Estacao.listarEstacoesAtivas();


        return res.json({ estacoes });


}
















}
module.exports = new EstacaoController();