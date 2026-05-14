const sensor = require("../models/Sensor");

class SensorController {

receberDadosWebSocket(dado){

    if(!dado.temperatura || !dado.umidade){
       return console.log("sem leitura");
    }

    const leitura = {                  
        temperatura: parseFloat(temperatura),
        umidade: parseFloat(umidade),
        timestamp: new Date().toISOString()
    }




    sensor.salvarLeitura(leitura);
    console.log("ok");

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
    return res.status(201).json({ status: "ok", recebido: leitura });
}





listarDados(req, res){

    const lista = sensor.listarDados();
    res.json(lista);

}







}
module.exports = new SensorController();