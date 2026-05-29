const db = require('../config/database');

class Sensor{


    salvarLeitura(temperatura, umidade, CO, gases){
        const stmt = db.prepare('INSERT INTO leituras (temperatura, umidade, CO, gases) VALUES (?, ?, ?, ?)');
     

    }

    listarDados(){



    }







}

module.exports = new Sensor();