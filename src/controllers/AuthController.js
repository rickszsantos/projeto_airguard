class AuthController {




login(req, res) {

    const email = req.email;
    const senha = req.senha;

    


    if($usuario && $senha == $usuario.verificarSenha($senha)){
       res.redirect("/home");
    }
    else{
     return res.render("login", { erro: "Login inválido" });
    }


}




cadastro() {

    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = $_POST['senha'];  
    //validarsenha($senha); colocar depois
   // if(validarEmail($email) && validarSenha($senha)){
     //   $usuario = new Usuario($nome, $email, $senha);
    //}
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