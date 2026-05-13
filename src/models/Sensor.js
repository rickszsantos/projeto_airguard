

class Sensor{

    // nome; //mq135, mq 7
    // tipo; //temperatura, umidade
    // localizacao;
    // status; //sensor com defeito ou desativado
    
    constructor(){

        this.registros = []


    }


    salvarLeitura(leitura){
        
        //conectar com o banco e 
        this.registros.push(leitura);

    }

    listarDados(){

        return this.registros;

    }







}

module.exports = new Sensor();