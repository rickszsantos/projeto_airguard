const db = require('../config/database');

class Leitura{


    salvarLeitura(temperatura, umidade, CO, gases){

        const stmt = db.prepare('INSERT INTO leituras (sensor_id, valor, unidade) VALUES (?, ?, ?)');
     
         stmt.run(1, temperatura, '°C');
         stmt.run(1, umidade, '%');
         stmt.run(2, CO, 'ppm');
         stmt.run(3, gases, 'ppm');


        return {  temperatura, umidade, CO, gases };
        
    }






    /*
    listarUltima() {
        const stmt = db.prepare(
            'SELECT * FROM leituras ORDER BY created_at DESC LIMIT 1'
        );
        return stmt.get() ?? null;
    }





    listarHistorico(periodo, sensor) {
        const filtros = {
            '24h': "datetime('now', '-1 day')",
            '7d':  "datetime('now', '-7 days')",
            '30d': "datetime('now', '-30 days')",
            '90d': "datetime('now', '-90 days')",
        };
        const desde = filtros[periodo] ?? filtros['7d'];

        let campos = 'id, temperatura, umidade, CO, gases, created_at AS timestamp';
        if (sensor && sensor !== 'todos') {
            const col = { temperatura: 'temperatura', umidade: 'umidade', CO: 'CO', gases: 'gases' }[sensor];
            if (col) campos = `id, ${col}, created_at AS timestamp`;
        }

        const stmt = db.prepare(
            `SELECT ${campos} FROM leituras WHERE created_at >= ${desde} ORDER BY created_at DESC LIMIT 500`
        );
        return stmt.all();
    }
    */






}

module.exports = new Leitura();