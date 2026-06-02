const db = require('../config/database');

class Leitura{


    salvarLeitura(temperatura, umidade, CO, gases, estacaoId = 1) {

        const sensorDHT  = db.prepare("SELECT id FROM sensores WHERE estacao_id = ? AND tipo = 'DHT22'  LIMIT 1").get(estacaoId);
        const sensorMQ7  = db.prepare("SELECT id FROM sensores WHERE estacao_id = ? AND tipo = 'MQ7'    LIMIT 1").get(estacaoId);
        const sensorMQ135= db.prepare("SELECT id FROM sensores WHERE estacao_id = ? AND tipo = 'MQ135'  LIMIT 1").get(estacaoId);

        
        const stmt = db.prepare('INSERT INTO leituras (sensor_id, valor, unidade) VALUES (?, ?, ?)');
        if (sensorDHT)  { stmt.run(sensorDHT.id,   temperatura, '°C'); }
        if (sensorDHT)  { stmt.run(sensorDHT.id,   umidade,     '%');  }
        if (sensorMQ7)  { stmt.run(sensorMQ7.id,   CO,          'ppm');}
        if (sensorMQ135){ stmt.run(sensorMQ135.id,  gases,       'ppm');}

       
        db.prepare(`
            INSERT INTO historico (estacao_id, temperatura, umidade, co_ppm, gases_ppm, indice_ar)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(estacaoId, temperatura, umidade, CO, gases, this._calcularIndice(CO, gases));

        return { temperatura, umidade, CO, gases };
    }



    _calcularIndice(co, gases) {
        // quanto maior o índice, pior o ar
        const iCO    = Math.min((co    / 400) * 100, 100);
        const iGases = Math.min((gases / 800) * 100, 100);
        return Math.max(iCO, iGases).toFixed(1);
    }




    ultimas(n = 20) {
        try {
            return db.prepare(`
                SELECT temperatura, umidade, co_ppm AS CO, gases_ppm AS gases,
                       created_at AS timestamp
                FROM historico
                ORDER BY id DESC
                LIMIT ?
            `).all(n).reverse(); // reverse para ordem cronológica
        } catch { return []; }
    }



    ultimaLeitura() {
        try {
            return db.prepare(`
                SELECT temperatura, umidade, co_ppm AS CO, gases_ppm AS gases,
                       created_at AS timestamp
                FROM historico
                ORDER BY id DESC LIMIT 1
            `).get() ?? null;
        } catch { return null; }
    }







    listarHistorico(periodo = '7d', limite = 500) {
        const filtros = {
            '24h': "datetime('now', '-1 day')",
            '7d':  "datetime('now', '-7 days')",
            '30d': "datetime('now', '-30 days')",
            '90d': "datetime('now', '-90 days')"
        };
        const desde = filtros[periodo] ?? filtros['7d'];
        try {
            return db.prepare(`
                SELECT temperatura, umidade, co_ppm AS CO, gases_ppm AS gases,
                       indice_ar, created_at AS timestamp
                FROM historico
                WHERE created_at >= ${desde}
                ORDER BY created_at ASC
                LIMIT ?
            `).all(limite);
        } catch { return []; }
    }




    alertasAtivos() {
        try {
            return db.prepare(`
                SELECT a.id, a.tipo, a.mensagem, a.valor,
                       a.created_at, e.nome AS estacao
                FROM alertas a
                JOIN estacoes e ON e.id = a.estacao_id
                WHERE a.resolvido = 0
                ORDER BY a.created_at DESC
                LIMIT 50
            `).all();
        } catch { return []; }
    }





    resolverAlerta(alertaId, usuarioId) {
        db.prepare(`
            UPDATE alertas
            SET resolvido = 1, resolvido_por = ?, resolvido_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(usuarioId, alertaId);
    }



}

module.exports = new Leitura();