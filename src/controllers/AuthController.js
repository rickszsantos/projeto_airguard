const bcrypt  = require('bcrypt');
const { podeFazer } = require('../middlewares/VerificarPermissao');
const Usuario = require('../models/Usuario');
const Leitura = require('../models/Leitura');
const Estacao = require('../models/Estacao');
 
class AuthController {
 
  _ctx(req) {
        const perfil = req.session.usuarioPerfil || 'funcionario';
        return {
            usuario: req.session.usuarioNome || 'Usuário',
            perfil,
            pode: (acao) => podeFazer(perfil, acao)
        };
    }

    showLogin(req, res)          { return res.render('login', { query: req.query }); }
    showCadastro(req, res)       { return res.render('cadastro'); }
    showRecuperarSenha(req, res) { return res.render('recuperarSenha'); }
    
    
    
    
    
    showConfiguracoes(req, res) {
    const Usuario = require('../models/Usuario');
    const usuarios = Usuario.listarTodos(); // ← busca todos os usuários

    return res.render('configuracao', {
        ...this._ctx(req),
        usuarioEmail: req.session.usuarioEmail || '', // ← faltava isso
        usuarios                                       // ← faltava isso
    });
    }



    

    
    showHome(req, res) {
        // pega últimas 20 leituras do banco para popular o gráfico imediatamente
        const ultimas  = Leitura.ultimas(20);
        const ultima   = ultimas.length ? ultimas[ultimas.length - 1] : null;
        const alertas  = Leitura.alertasAtivos();
        return res.render('home', {
            ...this._ctx(req),
            ultima,           // última leitura para os cards
            ultimas,          // array para o gráfico já ter dados
            alertasTotal: alertas.length
        });
    }

    showSensores(req, res) {
        const estacoes = Estacao.listarComSensores();
        const resumo   = Estacao.resumo();
        const alertas  = Leitura.alertasAtivos();
        return res.render('sensor', {
            ...this._ctx(req),
            estacoes,
            resumo,
            alertas,
            alertasTotal: alertas.length
        });
    }

    showHistorico(req, res) {
        const alertas = Leitura.alertasAtivos();
        return res.render('historico', {
            ...this._ctx(req),
            alertasTotal: alertas.length
        });
    }

    async cadastro(req, res) {
        try {
            const { nome, email, senha } = req.body;
            const senhaHash = await bcrypt.hash(senha, 10);
            Usuario.salvarUser(nome, email, senhaHash);
            return res.redirect('/login?cadastrado=1');
        } catch (erro) {
            console.error('[cadastro]', erro);
            return res.render('cadastro', { erro: 'Erro interno. Tente novamente.' });
        }
    }





    
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) return res.render('login', { erro: 'Preencha todos os campos.' });

            const usuario = Usuario.buscarPorEmail(email);
            if (!usuario) return res.render('login', { erro: 'Email ou senha inválidos.' });

            const ok = await bcrypt.compare(senha, usuario.senha);
            if (!ok)  return res.render('login', { erro: 'Email ou senha inválidos.' });

            req.session.usuarioId    = usuario.id;
            req.session.usuarioNome  = usuario.nome;
            req.session.usuarioEmail = usuario.email;
            req.session.usuarioPerfil = usuario.perfil;

            return res.redirect('/home');
        } catch (erro) {
            console.error('[login]', erro);
            return res.render('login', { erro: 'Erro interno. Tente novamente.' });
        }
    }






    //deslogar
    logout(req, res) {
        req.session.destroy(() => res.redirect('/login'));
    }
 
}
 
module.exports = new AuthController();


