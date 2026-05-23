class Usuario {

     //nome;
     //email;
     //#senha;
     //status;



    constructor(){
        
        this.registrosuser = []

    }





    salvarUser(nome, email, senha) {

        this.registrosuser.push({nome, email, senha});

    }


    emailExiste(email) {

        return this.registrosuser.find((user) => 

             user.email === email

        )? true : false;




    }
    
}
module.exports = new Usuario();
