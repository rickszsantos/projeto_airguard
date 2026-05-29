const sensor = require("../models/Sensor");

// recebe o wss de fora para poder emitir
let wssRef = null;

class SensorController {



    setWss(wss) {
        wssRef = wss; // guarda a referência do WebSocket
    }



//chamada rota HTTP
receberDados(req, res){

    const {temperatura, umidade, CO, gases} = req.body;


    if(temperatura === undefined || umidade === undefined){

          return res.status(400).json({   erro: "Sem leitura" });

    }



    sensor.salvarLeitura(temperatura, umidade, CO, gases);

    //if (wssRef) {
     //       wssRef.clients.forEach((client) => {
     //           client.send(JSON.stringify(leitura));
     //       });
     //   }


    return res.status(201).json({ status: "ok", recebido: leitura });
}





listarDados(req, res){

    const lista = sensor.listarDados();
    res.json(lista);

}







}
module.exports = new SensorController();