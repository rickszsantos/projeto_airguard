class Usuario {

     nome;
     email;
     #senha;
     status;

    construct($nome, $email, $senha){
        $this.nome = $nome;
        $this.email = $email;
        $this.senha = $senha;
        $this.status = true;
    }



    buscarPorEmail($emailFornecido){

        //verificar se o email ta no banco

        return null;
    }

    verificarSenha($senhaFornecida){
        return $this.#senha == $senhaFornecida;
    }

    validarEmail($emailInformado){
        return filter_var($emailInformado, FILTER_VALIDATE_EMAIL);
    }

    validarSenha($senhaInformada){
        return strlen($senhaInformada) >= 6;
    }

    desativarUser(){
        $this.status = false;
    }
}