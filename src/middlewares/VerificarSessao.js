function verificarSessao(req, res, next) {
  if (req.session && req.session.usuarioEmail) {
    return next(); // usuário logado — pode passar
  }
  return res.redirect('/login'); // não logado — volta para o login
}
 
module.exports = verificarSessao;
 