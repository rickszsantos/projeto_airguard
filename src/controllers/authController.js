const usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const validador = require("validator");

class AuthController {




   
showLogin(req, res){

return res.render("login");

}





showCadastro(req, res){

return res.render("cadastro");

}





showRecuperarSenha(req, res) {
  res.render("recuperarSenha");
}





showHome(req, res){

return res.render("home");

}







async login(req, res) {

    const {user, senha} = req.body;

    if(user === "adm" && senha === "123"){
       res.redirect("/home");
    }
    else{
     return res.render("login", { erro: "Login inválido" });
    }

    /*
    if($usuario && $senha == $usuario.verificarSenha($senha)){
       res.redirect("/home");
    }
    else{
     return res.render("login", { erro: "Login inválido" });
    }
    */

}










async cadastro(req, res) {

  try{

        const {nome, email, senha} = req.body;

        if(!nome || !senha || !email){
        return res.status(400).json({   erro: "Preencha todos os campos" });
        }
         

         const senhavalida = this.validarsenha(senha);

         if(!senhavalida.valido) {

            return res.status(400).json({erro: senhavalida.mensagem})

         }


          const emailvalido = this.validaremail(email);

          if(!emailvalido.valido) {

             return res.status(400).json({ erro: emailvalido.mensagem})

          }



        
         const senhaHash = await bcrypt.hash(senha, 10);
         await usuario.salvarUser(nome, email, senhaHash);
    

         return res.status(201).json({ sucesso: "Usuário cadastrado"});
         

    }
    catch(erro) {

            return res.status(500).json({ erro: "Erro interno" });

    }

}



validarsenha(senha){


      if (senha.length >= 6 && 
          /[A-Z]/.test(senha) && 
          /[a-z]/.test(senha) && 
          /[0-9]/.test(senha) && 
          /[^A-Za-z0-9]/.test(senha))
          {

                return { valido: true };

          }
          else{

                return { valido: false, mensagem: "Senha fraca. Use letras, números e símbolos." }
          }
      
}

validaremail(email) {

    if(validador.isEmail(email)){ return {valido: true};}
    else{ return { valido: false, mensagem: "Digite um email valido" } }

}




}
module.exports = new AuthController();