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













    

    async atualizarMeuPerfil(req, res) {
    const { nome, email } = req.body;
    const id = req.session.usuarioId;

    if (!nome?.trim() || !email?.trim())
      return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });

    const existente = Usuario.buscarPorEmail(email.trim());
    if (existente && existente.id !== id)
      return res.status(400).json({ erro: 'Este email já está em uso.' });

    Usuario.atualizarPerfil(id, nome.trim(), email.trim());
    req.session.usuarioNome  = nome.trim();
    req.session.usuarioEmail = email.trim();
    return res.json({ ok: true });
  }













  async atualizarMinhaSenha(req, res) {
    const { senha_atual, nova_senha, confirmar_senha } = req.body;
    const id = req.session.usuarioId;

    if (!senha_atual || !nova_senha || !confirmar_senha)
      return res.status(400).json({ erro: 'Preencha todos os campos.' });

    if (nova_senha !== confirmar_senha)
      return res.status(400).json({ erro: 'As senhas não coincidem.' });

    if (nova_senha.length < 8)
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 8 caracteres.' });

    const usuario  = Usuario.buscarPorId(id);
    const completo = Usuario.buscarPorEmail(usuario.email);
    const ok = await bcrypt.compare(senha_atual, completo.senha);
    if (!ok) return res.status(400).json({ erro: 'Senha atual incorreta.' });

    const hash = await bcrypt.hash(nova_senha, 10);
    Usuario.atualizarSenha(id, hash);
    return res.json({ ok: true });
  }










  listarUsuarios(req, res) {
    return res.json(Usuario.listar());
  }














  async alterarPerfilUsuario(req, res) {
    const { id } = req.params;
    const { perfil } = req.body;

    if (!['funcionario', 'admin', 'superadmin'].includes(perfil))
      return res.status(400).json({ erro: 'Perfil inválido.' });

    if (parseInt(id) === req.session.usuarioId && req.session.usuarioPerfil === 'superadmin')
      return res.status(400).json({ erro: 'Não é possível alterar o próprio perfil de SuperAdmin.' });

    Usuario.alterarPerfil(id, perfil);
    return res.json({ ok: true });
  }











  async alterarStatusUsuario(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (![0, 1].includes(parseInt(status)))
      return res.status(400).json({ erro: 'Status inválido.' });

    if (parseInt(id) === req.session.usuarioId)
      return res.status(400).json({ erro: 'Não é possível desativar sua própria conta.' });

    Usuario.alterarStatus(id, parseInt(status));
    return res.json({ ok: true });
  }




  async uploadFotoPerfil(req, res) {
    const id = req.session.usuarioId;
    if (!req.file) return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });

    const caminho = `/uploads/avatars/${req.file.filename}`;
    Usuario.atualizarFotoPerfil(id, caminho);
    req.session.usuarioFoto = caminho;
    return res.json({ ok: true, foto: caminho });
  }





  async promoverUsuario(req, res) {
    const { id } = req.params;

    if (req.session.usuarioPerfil !== 'superadmin')
      return res.status(403).json({ erro: 'Apenas o SuperAdmin pode promover usuários.' });

    const alvo = Usuario.buscarPorId(parseInt(id));
    if (!alvo)                        return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (alvo.perfil !== 'funcionario') return res.status(400).json({ erro: 'Só é possível promover funcionários para Admin.' });
    if (alvo.perfil === 'superadmin') return res.status(400).json({ erro: 'Não é possível alterar um SuperAdmin.' });

    const ok = Usuario.promover(parseInt(id));
    if (!ok) return res.status(400).json({ erro: 'Não foi possível promover este usuário.' });
    return res.json({ ok: true });
  }





  excluirUsuario(req, res) {
    const { id } = req.params;

    if (parseInt(id) === req.session.usuarioId)
      return res.status(400).json({ erro: 'Não é possível excluir sua própria conta.' });

    const alvo = Usuario.buscarPorId(id);
    if (!alvo) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (alvo.perfil === 'superadmin')
      return res.status(400).json({ erro: 'Não é possível excluir um SuperAdmin.' });

    Usuario.desativar(parseInt(id));
    return res.json({ ok: true });
  }












  listarLogs(req, res) {
    const db = require('../config/database');
    const { tipo, tabela, limite } = req.query;

    let sql = `
      SELECT l.id, l.tipo_evento, l.tabela_afetada, l.registro_id,
             l.descricao, l.dados_anteriores, l.dados_novos,
             l.created_at, u.nome AS usuario_nome
      FROM logs_sistema l
      LEFT JOIN usuarios u ON u.id = l.usuario_id
      WHERE 1=1
    `;
    const params = [];

    if (tipo)   { sql += ' AND l.tipo_evento = ?';    params.push(tipo); }
    if (tabela) { sql += ' AND l.tabela_afetada = ?'; params.push(tabela); }

    sql += ' ORDER BY l.created_at DESC LIMIT ?';
    params.push(parseInt(limite) || 100);

    try {
      const logs = db.prepare(sql).all(...params);
      return res.json({ logs });
    } catch (err) {
      console.error('[listarLogs]', err);
      return res.status(500).json({ erro: 'Erro ao carregar logs.' });
    }
  }
 
}
 
module.exports = new AuthController();


