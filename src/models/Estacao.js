const db = require('../config/database');

class Estacao{


    listarEstacoesAtivas() {
        const stmt = db.prepare(`
        SELECT id, nome, descricao, latitude, longitude,
               intervalo_leitura, status, created_at
        FROM estacoes
        WHERE status = 'ativa'
        ORDER BY nome
        `);

        return stmt.all();


    }



}

module.exports = new Estacao();