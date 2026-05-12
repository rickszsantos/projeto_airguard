const sensorModel = require("../models/Sensor");

class SensorController {


receberDados(req, res){

    const {temperatura, umidade} = req.body;


    if(temperatura === undefined || umidade === undefined){

            return console.log("sem leitura");

    }



    const leitura = {                  
        temperatura: parseFloat(body.temperatura),
        umidade: parseFloat(body.umidade),
        timestamp: new Date().toISOString
    }



    sensorModel.salvarLeitura(leitura);


}





listarDados(req, res){

    const lista = sensorModel.listarDados();
    res.json(lista);

}







}
module.exports = new SensorController();