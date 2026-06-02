const Estacao = require('../models/Estacao');
const db      = require('../config/database');

class EstacaoController {

    listarEstacoes(req, res) {
        try {
            const estacoes    = Estacao.listarComSensores();
            const resumo      = Estacao.resumo();

            // leituras de hoje usando a tabela historico
            let leituras_hoje = 0;
            try {
                leituras_hoje = db.prepare(
                    "SELECT COUNT(*) AS n FROM historico WHERE date(created_at) = date('now')"
                ).get()?.n ?? 0;
            } catch (_) {}

            return res.json({ estacoes, resumo, leituras_hoje });
        } catch (err) {
            console.error('[listarEstacoes]', err);
            return res.status(500).json({ estacoes: [], resumo: {}, leituras_hoje: 0 });
        }
    }

    atualizarStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        if (!['ativa', 'inativa', 'manutencao'].includes(status))
            return res.status(400).json({ erro: 'Status inválido' });
        Estacao.atualizarStatus(id, status);
        res.json({ ok: true });
    }
}

module.exports = new EstacaoController();