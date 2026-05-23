class Usuario {

     //nome;
     //email;
     //#senha;
     //status;



    constructor(){
        
        this.registrosuser = []

    }





    salvarUser(nome, email, senha) {

        const user = {                  
                nome: nome,
                email: email,
                senha: senha,
        }

        this.registrosuser.push(user);

    }


    emailExiste(email) {

        return registrouser.find((user) => 

             user.email === email

        )? true : false;




    }


    




}
