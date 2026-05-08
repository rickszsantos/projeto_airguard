const sensorModel = require("../models/Sensor");

class SensorController {
























receber_leitura(req, res){

    sensorModel.salvarLeitura();

}


}
module.exports = new SensorController();