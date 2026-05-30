const Leitura = require("../models/Leitura");

// recebe o wss de fora para poder emitir
let wssRef = null;

class LeituraController {



    setWss(wss) {
        wssRef = wss;
    }




receberDados(req, res){

    const {temperatura, umidade, gases, CO} = req.body;


    if(temperatura === undefined ){

          return res.status(400).json({   erro: "Sem leitura, temperatura" });

    }
    if(umidade === undefined ){

          return res.status(400).json({   erro: "Sem leitura, umidade" });

    }
    if(CO === undefined ){

          return res.status(400).json({   erro: "Sem leitura, CO" });

    }
    if(gases === undefined){

          return res.status(400).json({   erro: "Sem leitura, gases" });

    }



    Leitura.salvarLeitura(temperatura, umidade, CO, gases);

    

        if (wssRef) {
          const payload = JSON.stringify({ temperatura, umidade, CO, gases });
            wssRef.clients.forEach(client => {
            if (client.readyState === 1) { // 1 = OPEN
                client.send(payload);
            }
         });
        }

    return res.status(201).json({ status: "ok", recebido: { temperatura, umidade, CO, gases } });
}












}
module.exports = new LeituraController();