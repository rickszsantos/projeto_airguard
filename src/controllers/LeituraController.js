const Leitura = require('../models/Leitura');

let wssRef = null;

class LeituraController {

    setWss(wss) { wssRef = wss; }

    _broadcast(payload) {
        if (!wssRef) return;
        const msg = JSON.stringify(payload);
        wssRef.clients.forEach(client => {
            if (client.readyState === 1 && client._tipo !== 'esp32') {
                client.send(msg);
            }
        });
    }

    receberDados(req, res) {
        const { temperatura, umidade, gases, CO } = req.body;

        if (temperatura === undefined) return res.status(400).json({ erro: 'Falta: temperatura' });
        if (umidade     === undefined) return res.status(400).json({ erro: 'Falta: umidade' });
        if (CO          === undefined) return res.status(400).json({ erro: 'Falta: CO' });
        if (gases       === undefined) return res.status(400).json({ erro: 'Falta: gases' });

        Leitura.salvarLeitura(temperatura, umidade, CO, gases);
        this._broadcast({ temperatura, umidade, CO, gases });

        return res.status(201).json({ status: 'ok', recebido: { temperatura, umidade, CO, gases } });
    }

    listarHistorico(req, res) {
        const { periodo = '7d' } = req.query;
        const dados = Leitura.listarHistorico(periodo);
        res.json({ dados, total: dados.length });
    }

    ultimaLeitura(req, res) {
        const ultima = Leitura.ultimaLeitura();
        res.json(ultima ?? {});
    }
}

module.exports = new LeituraController();