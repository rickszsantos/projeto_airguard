const db = require('../config/database');

class Estacao{


    listarComSensores() {
        try {
            const estacoes = db.prepare(`
                SELECT id, nome, descricao, latitude, longitude,
                       intervalo_leitura, status, created_at
                FROM estacoes ORDER BY nome
            `).all();

            return estacoes.map(e => ({
                ...e,
                sensores: db.prepare(`
                    SELECT id, tipo, descricao, status
                    FROM sensores WHERE estacao_id = ?
                    ORDER BY tipo
                `).all(e.id)
            }));
        } catch { return []; }
    }




    resumo() {
        try {
            return {
                estacoes_total:  db.prepare("SELECT COUNT(*) AS n FROM estacoes").get()?.n ?? 0,
                estacoes_ativas: db.prepare("SELECT COUNT(*) AS n FROM estacoes WHERE status = 'ativa'").get()?.n ?? 0,
                sensores_total:  db.prepare("SELECT COUNT(*) AS n FROM sensores").get()?.n ?? 0,
                sensores_ativos: db.prepare("SELECT COUNT(*) AS n FROM sensores WHERE status = 'ativo'").get()?.n ?? 0,
            };
        } catch { return { estacoes_total:0, estacoes_ativas:0, sensores_total:0, sensores_ativos:0 }; }
    }






    criar(nome, descricao, latitude, longitude, intervalo = 5000) {
        return db.prepare(`INSERT INTO estacoes (nome, descricao, latitude, longitude, intervalo_leitura) VALUES (?, ?, ?, ?, ?)
        `).run(nome, descricao, latitude, longitude, intervalo);
    }




    criarSensor(estacaoId, tipo, descricao) {
        return db.prepare(`INSERT INTO sensores (estacao_id, tipo, descricao) VALUES (?, ?, ?)
        `).run(estacaoId, tipo, descricao);
    }



    atualizarStatus(id, status) {
        db.prepare("UPDATE estacoes SET status = ? WHERE id = ?").run(status, id);
        
        const statusSensor = status === 'ativa' ? 'ativo' : 'inativo';
    db.prepare("UPDATE sensores SET status = ? WHERE estacao_id = ?").run(statusSensor, id);
    }


    leiturasdiarias() {

        return db.prepare("SELECT COUNT(*) AS n FROM historico WHERE date(created_at, 'localtime') = date('now', 'localtime')").get()?.n ?? 0;
   
    }




    excluir(id) {
    db.prepare("DELETE FROM estacoes WHERE id = ?").run(id);
    }




}

module.exports = new Estacao();