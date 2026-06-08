const Estacao = require('../models/Estacao');
const db      = require('../config/database');
const { enviarESP32 } = require('../utils/esp32');

class EstacaoController {

   listarEstacoes(req, res) {
        try {
            const estacoes    = Estacao.listarComSensores();
            const resumo      = Estacao.resumo();
            const leituras_hoje = Estacao.leiturasdiarias();
            return res.json({ estacoes, resumo, leituras_hoje });
        } catch (err) {
            console.error('[listarEstacoes]', err);
            return res.status(500).json({ estacoes: [], resumo: {}, leituras_hoje: 0 });
        }
    }





    criarEstacao(req, res) {
        const { nome, descricao, latitude, longitude, intervalo } = req.body;

        if (!nome || nome.trim() === '')
            return res.status(400).json({ erro: 'Nome da estação é obrigatório' });

        try {
            // 1 — cria a estação
            const result = Estacao.criar(
                nome.trim(),
                descricao?.trim() || null,
                latitude  ? parseFloat(latitude)  : null,
                longitude ? parseFloat(longitude) : null,
                intervalo ? parseInt(intervalo) * 1000 : 5000
            );

            const estacaoId = result.lastInsertRowid;

            // 2 — cria os 3 sensores padrão vinculados à estação
            Estacao.criarSensor(estacaoId, 'DHT22', 'Temperatura e Umidade');
            Estacao.criarSensor(estacaoId, 'MQ7',   'Monóxido de Carbono');
            Estacao.criarSensor(estacaoId, 'MQ135', 'Qualidade do Ar Geral');

            return res.status(201).json({
                ok: true,
                id: estacaoId,
                mensagem: `Estação "${nome}" criada com 3 sensores padrão`
            });
        } catch (err) {
            console.error('[criarEstacao]', err);
            return res.status(500).json({ erro: 'Erro ao criar estação' });
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




    editarEstacao(req, res) {
        const { id } = req.params;
        const { nome, descricao, latitude, longitude } = req.body;

        if (!nome?.trim())
            return res.status(400).json({ erro: 'Nome é obrigatório' });

        try {
            db.prepare(`
                UPDATE estacoes
                SET nome=?, descricao=?, latitude=?, longitude=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            `).run(
                nome.trim(),
                descricao?.trim() || null,
                latitude  !== '' && latitude  != null ? parseFloat(latitude)  : null,
                longitude !== '' && longitude != null ? parseFloat(longitude) : null,
                id
            );
            return res.json({ ok: true });
        } catch (err) {
            console.error('[editarEstacao]', err);
            return res.status(500).json({ erro: 'Erro ao editar estação' });
        }
    }




    
    async excluirEstacao(req, res) {
        const { id } = req.params;
        try {
            Estacao.excluir(id);
            return res.json({ ok: true, mensagem: 'Estação excluída com sucesso' });
        } catch (err) {
            console.error('[excluirEstacao]', err);
            return res.status(500).json({ erro: 'Erro ao excluir estação' });
        }
    }









    atualizarIntervalo(req, res) {
        const { id } = req.params;
        const { intervalo } = req.body;
        const ms = parseInt(intervalo) * 1000;
        if (isNaN(ms) || ms < 1000)
            return res.status(400).json({ erro: 'Intervalo mínimo: 1 segundo' });
        try {
            db.prepare('UPDATE estacoes SET intervalo_leitura=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(ms, id);
            enviarESP32(parseInt(id), { comando: 'SET_INTERVALO', intervalo: ms });
            return res.json({ ok: true, intervalo_ms: ms });
        } catch (err) {
            return res.status(500).json({ erro: 'Erro ao atualizar intervalo' });
        }
    }

    


}

module.exports = new EstacaoController();
