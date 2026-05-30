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








}

module.exports = new Leitura();