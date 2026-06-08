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
        if (sensorMQ135){ stmt.run(sensorMQ135.id, gases,       'ppm');}
        
       
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
            `).all(n).reverse(); 
        } catch { return []; }
    }


    





    historicoAgregado(periodo = '7d') {
        const config = {
            '24h': {
                desde:  "datetime('now', '-1 day')",
                grupo:  "strftime('%Y-%m-%d %H:00', created_at)",
                label:  "strftime('%d/%m %H:00', created_at)"
            },
            '7d': {
                desde:  "datetime('now', '-7 days')",
                // agrupa a cada 12h: 00:00 ou 12:00
                grupo:  "strftime('%Y-%m-%d', created_at) || ' ' || (CASE WHEN CAST(strftime('%H', created_at) AS INTEGER) < 12 THEN '00' ELSE '12' END) || ':00'",
                label:  "strftime('%d/%m', created_at) || (CASE WHEN CAST(strftime('%H', created_at) AS INTEGER) < 12 THEN ' manhã' ELSE ' tarde' END)"
            },
            '30d': {
                desde:  "datetime('now', '-30 days')",
                grupo:  "strftime('%Y-%m-%d', created_at)",
                label:  "strftime('%d/%m', created_at)"
            },
            '90d': {
                desde:  "datetime('now', '-90 days')",
                // semana ISO: ano + número da semana
                grupo:  "strftime('%Y-W', created_at) || strftime('%W', created_at)",
                label:  "'Sem ' || CAST(strftime('%W', created_at) AS INTEGER)"
            }
        };

        const c = config[periodo] ?? config['7d'];

        try {
            const rows = db.prepare(`
                SELECT
                    ${c.label}                   AS label,
                    ROUND(AVG(temperatura), 1)   AS temperatura,
                    ROUND(AVG(umidade), 1)        AS umidade,
                    ROUND(AVG(co_ppm), 1)         AS CO,
                    ROUND(AVG(gases_ppm), 1)      AS gases,
                    ROUND(AVG(indice_ar), 1)      AS indice_ar,
                    COUNT(*)                      AS total_registros,
                    MIN(created_at)               AS timestamp_inicio,
                    MAX(created_at)               AS timestamp_fim
                FROM historico
                WHERE created_at >= ${c.desde}
                GROUP BY ${c.grupo}
                ORDER BY timestamp_inicio ASC
            `).all();

            // resumo geral do período para os cards
            const resumo = db.prepare(`
                SELECT
                    ROUND(AVG(temperatura), 1) AS media_temp,
                    ROUND(AVG(umidade), 1)      AS media_umidade,
                    ROUND(AVG(co_ppm), 1)       AS media_co,
                    ROUND(AVG(gases_ppm), 1)    AS media_gases,
                    MAX(gases_ppm)              AS pior_gases,
                    MAX(co_ppm)                 AS pior_co,
                    SUM(total_registros_sub)    AS total_registros
                FROM (
                    SELECT gases_ppm, co_ppm, temperatura, umidade,
                           COUNT(*) AS total_registros_sub
                    FROM historico
                    WHERE created_at >= ${c.desde}
                    GROUP BY id
                ) sub
            `).get();

            return { pontos: rows, resumo };
        } catch (e) {
            console.error('[historicoAgregado]', e);
            return { pontos: [], resumo: null };
        }
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