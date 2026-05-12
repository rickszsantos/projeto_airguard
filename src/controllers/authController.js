class AuthController {



showLogin(req, res){

return res.render("login");

}

showCadastro(req, res){

return res.render("cadastro");

}

showHome(req, res){

return res.render("home");

}



login(req, res) {


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


showRecuperarSenha(req, res) {
  res.render("recuperarSenha");
}












/*

--login();
--cadastro();


logout();
esqueciSenha();
trocarSenha();
verificarSessao();   ????

*/






}
module.exports = new AuthController();