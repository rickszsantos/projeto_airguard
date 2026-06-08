const Leitura = require('../models/Leitura');
const Estacao = require('../models/Estacao');


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
        const { temperatura, umidade, gases, CO, estacao_id } = req.body;

        if (temperatura === undefined) return res.status(400).json({ erro: 'Falta: temperatura' });
        if (umidade     === undefined) return res.status(400).json({ erro: 'Falta: umidade' });
        if (CO          === undefined) return res.status(400).json({ erro: 'Falta: CO' });
        if (gases       === undefined) return res.status(400).json({ erro: 'Falta: gases' });

        const idEstacao = parseInt(estacao_id) || 1; 
        Leitura.salvarLeitura(temperatura, umidade, CO, gases, idEstacao);

        this._broadcast({ tipo: 'leitura', temperatura, umidade, CO, gases });

        const alertas = Leitura.alertasAtivos();
        this._broadcast({ tipo: 'alertas', total: alertas.length, lista: alertas });

        return res.status(201).json({ status: 'ok', recebido: { temperatura, umidade, CO, gases , estacao_id} });
    }






    ultimas(req, res) {
        const n = parseInt(req.query.n) || 20;
        return res.json(Leitura.ultimas(n));
    }






    historico(req, res) {
        const periodo = req.query.periodo || '7d';
        const { pontos, resumo } = Leitura.historicoAgregado(periodo);
        return res.json({ pontos, resumo, periodo });
    }



    

    listarAlertas(req, res) {
        return res.json(Leitura.alertasAtivos());
    }





    resolverAlerta(req, res) {
        const { id }    = req.params;
        const usuarioId = req.session?.usuarioId ?? null;
        Leitura.resolverAlerta(id, usuarioId);

        const alertas = Leitura.alertasAtivos();
        this._broadcast({ tipo: 'alertas', total: alertas.length, lista: alertas });

        return res.json({ ok: true });
    }
   











   
}

module.exports = new LeituraController();