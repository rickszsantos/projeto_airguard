class Sensor{

    // nome; //mq135, mq 7
    // tipo; //temperatura, umidade
    // localizacao;
    // status; //sensor com defeito ou desativado
    
    constructor(){

        $this.registros = []


    }


    salvarLeitura(req, res){
        
        //conectar com o banco e 
        this.registros.push(leitura);

    }

    listarDados(req, res){

        return this.registros;

    }







}