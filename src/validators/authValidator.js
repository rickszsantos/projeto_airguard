const validator        = require('validator');
const { validarSenha } = require('../utils/regrasSenha');
const Usuario          = require('../models/Usuario');
 
function validarCadastro(req, res, next) {
  const { nome, email, senha, confirmar } = req.body;
 
  // 1. Campos obrigatórios
  if (!nome || !email || !senha || !confirmar) {
    return res.render('cadastro', { erro: 'Preencha todos os campos.' });
  }
 
  // 2. Nome mínimo
  if (nome.trim().length < 3) {
    return res.render('cadastro', { erro: 'Nome deve ter ao menos 3 caracteres.' });
  }
 
  // 3. Email válido (usa a biblioteca validator)
  if (!validator.isEmail(email)) {
    return res.render('cadastro', { erro: 'Email inválido.' });
  }
 
  // 4. Email já cadastrado
  if (Usuario.emailExiste(email)) {
    return res.render('cadastro', { erro: 'Este email já está cadastrado.' });
  }
 
  // 5. Regras de senha (vem do utils/regrasSenha.js)
  const erroSenha = validarSenha(senha);
  if (erroSenha) {
    return res.render('cadastro', { erro: erroSenha });
  }
 
  // 6. Senhas coincidem
  if (senha !== confirmar) {
    return res.render('cadastro', { erro: 'As senhas não coincidem.' });
  }
 
  // Tudo certo — segue para o controller
  next();
}








 
module.exports = validarCadastro;
 