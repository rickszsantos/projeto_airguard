class Usuario {

     //nome;
     //email;
     //#senha;
     //status;



    constructor(){
        
        this.registros = []

    }





    salvarUser(nome, email, senha) {


        




        const user = {                  
                nome: nome,
                email: email,
                senha: senha,
        }

        this.registros.push(user);

    }


    




}
