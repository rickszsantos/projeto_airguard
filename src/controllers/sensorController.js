const sensor = require("../models/Sensor");

// recebe o wss de fora para poder emitir
let wssRef = null;

class SensorController {



    setWss(wss) {
        wssRef = wss; // guarda a referência do WebSocket
    }



//chamada rota HTTP
receberDados(req, res){

    const {temperatura, umidade} = req.body;


    if(temperatura === undefined || umidade === undefined){

          return res.status(400).json({   erro: "Sem leitura" });

    }



    const leitura = {                  
        temperatura: parseFloat(temperatura),
        umidade: parseFloat(umidade),
        timestamp: new Date().toISOString()
    }



    sensor.salvarLeitura(leitura);

    if (wssRef) {
            wssRef.clients.forEach((client) => {
                client.send(JSON.stringify(leitura));
            });
        }


    return res.status(201).json({ status: "ok", recebido: leitura });
}





listarDados(req, res){

    const lista = sensor.listarDados();
    res.json(lista);

}







}
module.exports = new SensorController();