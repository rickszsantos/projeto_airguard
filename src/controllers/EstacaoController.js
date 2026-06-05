const Estacao = require('../models/Estacao');
const db      = require('../config/database');
const { enviarESP32 } = require('../utils/esp32');

class EstacaoController {

    listarEstacoes(req, res) {



console.log('>>> entrou no listarEstacoes');
const estacoes = Estacao.listarComSensores();
console.log('>>> estacoes ok', estacoes.length);
const resumo = Estacao.resumo();
console.log('>>> resumo ok');
let leituras_hoje = 0;
try {
    leituras_hoje = Estacao.leiturasdiarias();
    console.log('>>> leituras_hoje:', leituras_hoje);
} catch (err) {
    console.error('>>> ERRO leiturasdiarias:', err);
}
console.log('>>> json final:', { leituras_hoje });




        try {
            const estacoes    = Estacao.listarComSensores();
            const resumo      = Estacao.resumo();

            // leituras de hoje usando a tabela historico
            let leituras_hoje = 0;
            try {
                leituras_hoje = Estacao.leiturasdiarias();
                console.log(leituras_hoje);
                
            } catch (err) {console.error('[leiturasdiarias ERROR]', err);

            }


            return res.json({ estacoes, resumo, leituras_hoje });
        } catch (err) {
            console.error('[listarEstacoes]', err);
            return res.status(500).json({ estacoes: [], resumo: {}, leituras_hoje: {} });
        }
    }




    
    atualizarStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;


        if (!['ativa', 'inativa', 'manutencao'].includes(status))
            return res.status(400).json({ erro: 'Status inválido' });

        Estacao.atualizarStatus(id, status);

        if (status === 'ativa') {
        enviarESP32(parseInt(id), { comando: 'INICIAR_LEITURA', estacao_id: parseInt(id) });
        } else {
        enviarESP32(parseInt(id), { comando: 'PARAR_LEITURA', estacao_id: parseInt(id) });
        }

        return res.json({ ok: true });
    }




    







}

module.exports = new EstacaoController();