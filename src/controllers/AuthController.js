const bcrypt  = require('bcrypt');
const Usuario = require('../models/Usuario');
 
class AuthController {
 
  // ── Views (só renderizam a tela) ─────────────────────────────────────────
  showLogin(req, res)          { return res.render('login', { query: req.query }); }
  showCadastro(req, res)       { return res.render('cadastro'); }
  showRecuperarSenha(req, res) { return res.render('recuperarSenha'); }
  showHome(req, res)           { return res.render('home'); }
 




  // ── Cadastro ─────────────────────────────────────────────────────────────
  async cadastro(req, res) {
    try {
      const { nome, email, senha } = req.body;
 
      // Gera o hash da senha antes de salvar
      // O "10" é o número de rounds — quanto maior, mais seguro e mais lento
      const senhaHash = await bcrypt.hash(senha, 10);
 
      // Salva no array (futuramente: no banco de dados)
      Usuario.salvarUser(nome, email, senhaHash);
 
      // Redireciona para o login com mensagem de sucesso
      return res.redirect('/login?cadastrado=1');
 
    } catch (erro) {
      console.error('[cadastro] Erro:', erro);
      return res.render('cadastro', { erro: 'Erro interno. Tente novamente.' });
    }
  }
 








  
  // ── Login ─────────────────────────────────────────────────────────────────
  async login(req, res) {
    try {
      const { email, senha } = req.body;
 
      // Campos vazios
      if (!email || !senha) {
        return res.render('login', { erro: 'Preencha todos os campos.' });
      }
 
      // Busca o usuário pelo email
      const usuario = Usuario.buscarPorEmail(email);
      if (!usuario) {
        
        return res.render('login', { erro: 'Email ou senha inválidos.' });
      }
 

      
      // Compara a senha digitada com o hash salvo
      // bcrypt.compare faz isso de forma segura
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.render('login', { erro: 'Email ou senha inválidos.' });
      }
 
      // Cria a sessão — guarda quem está logado
      req.session.usuarioNome  = usuario.nome;
      req.session.usuarioEmail = usuario.email;
      req.session.usuarioPerfil = usuario.perfil; 
      
      return res.redirect('/home');
 
    } catch (erro) {
      console.error('[login] Erro:', erro);
      return res.render('login', { erro: 'Erro interno. Tente novamente.' });
    }
  }
 
  // ── Logout ────────────────────────────────────────────────────────────────
  logout(req, res) {
    req.session.destroy(() => {
      return res.redirect('/login');
    });
  }
 
}
 
module.exports = new AuthController();