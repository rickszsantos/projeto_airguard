class Usuario {

    constructor(){
        
        this.registros = []

    }





    salvarUser(nome, email, senha) {

        const novoUser = { nome, email, senha };

        this.registros.push(novoUser);
        return novoUser;

    }


    emailExiste(email) {

    return this.registros.some(user => user.email === email);

    }


    listarTodos() {
    return this.registros;
    }



    
    buscarPorEmail(email) {
    return this.registros.find(user => user.email === email) || null;
    }

    
}
module.exports = new Usuario();
