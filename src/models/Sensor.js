class Sensor{

    nome; //mq135, mq 7
    tipo; //temperatura, umidade
    localizacao;
    status; //sensor com defeito ou desativado
    
    constructor($nome, $tipo, $localizacao){

        $this.nome = $nome;
        $this.tipo = $tipo;
        $this.localizacao = $localizacao
        $this.status = true;


    }







}