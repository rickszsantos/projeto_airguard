class AuthController {



showlogin(req, res){

return res.render("login");

}




login(req, res) {
    const user = req.body.usuario;
    const senha = req.body.senha;


    if($usuario && $senha == $usuario.verificarSenha($senha)){
       res.redirect("/home");
    }
    else{
     return res.render("login", { erro: "Login inválido" });
    }


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