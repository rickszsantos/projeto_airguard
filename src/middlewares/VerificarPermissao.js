const bcrypt  = require('bcrypt');
const Usuario = require('../models/Usuario');

// ── Tabela de permissões por ação ──────────────────────────────
// 'livre'      → qualquer usuário logado
// 'admin'      → admin ou superadmin
// 'superadmin' → só superadmin (exige confirmação de senha)
const PERMISSOES = {
    // Estações
    'estacao:criar':           'admin',
    'estacao:editar':          'admin',
    'estacao:excluir':         'admin',
    'estacao:status':          'admin',
    'estacao:intervalo':       'admin',

    // Sensores
    'sensor:criar':            'admin',
    'sensor:editar':           'admin',
    'sensor:excluir':          'superadmin',
    'sensor:status':           'admin',

    // Usuários
    'usuario:criar':           'admin',
    'usuario:editar':          'admin',
    'usuario:excluir':         'superadmin',
    'usuario:alterarPerfil':   'superadmin',

    // Alertas
    'alerta:resolver':         'funcionario',
    'alerta:resolverTodos':    'admin',

    // Configurações gerais
    'config:geral':            'admin',
    'config:sistema':          'superadmin',
};

// Hierarquia: superadmin > admin > funcionario
const NIVEL = { funcionario: 1, admin: 2, superadmin: 3 };

/**
 * verPermissao(acao)
 * Middleware para rotas — bloqueia se o perfil da sessão não tiver acesso.
 * Uso: router.delete('/estacoes/:id', verPermissao('estacao:excluir'), controller.excluir)
 */
function verPermissao(acao) {
    return (req, res, next) => {
        const perfilUsuario = req.session?.usuarioPerfil || 'funcionario';
        const nivelNecessario = PERMISSOES[acao];

        if (!nivelNecessario) return next(); // ação não mapeada → livre

        const nivelUsuario   = NIVEL[perfilUsuario]   || 0;
        const nivelRequerido = NIVEL[nivelNecessario]  || 99;

        if (nivelUsuario >= nivelRequerido) return next();

        return res.status(403).json({
            erro: 'Sem permissão',
            requer: nivelNecessario,
            perfil: perfilUsuario
        });
    };
}

/**
 * verificarSenhaSuperAdmin(senha)
 * Função assíncrona — verifica a senha do superadmin.
 * Retorna { ok: true } ou { ok: false, erro: '...' }
 */
async function verificarSenhaSuperAdmin(senha) {
    if (!senha) return { ok: false, erro: 'Senha obrigatória' };
    const sa = Usuario.buscarSuperAdmin();
    if (!sa)  return { ok: false, erro: 'Nenhum SuperAdmin cadastrado no sistema' };
    const bate = await bcrypt.compare(senha, sa.senha);
    return bate ? { ok: true } : { ok: false, erro: 'Senha incorreta' };
}

/**
 * verSenhaAdmin(acao)
 * Middleware que combina: verifica perfil E exige senha de superadmin no body
 * Uso: router.delete('/estacoes/:id', verSenhaAdmin('estacao:excluir'), controller.excluir)
 */
function verSenhaAdmin(acao) {
    return async (req, res, next) => {
        // 1. Verifica perfil mínimo (admin)
        const perfilUsuario = req.session?.usuarioPerfil || 'funcionario';
        const nivelUsuario  = NIVEL[perfilUsuario] || 0;
        if (nivelUsuario < NIVEL['admin']) {
            return res.status(403).json({ erro: 'Acesso restrito a administradores' });
        }

        // 2. Para ações de superadmin, exige senha
        const nivelAcao = NIVEL[PERMISSOES[acao]] || 0;
        if (nivelAcao >= NIVEL['superadmin']) {
            const { senha_superadmin } = req.body;
            const resultado = await verificarSenhaSuperAdmin(senha_superadmin);
            if (!resultado.ok) {
                return res.status(403).json({ erro: resultado.erro, requer_senha: true });
            }
        }

        next();
    };
}

/**
 * podeFazer(perfil, acao)
 * Helper para usar em views EJS e controllers
 * Ex: podeFazer('admin', 'estacao:criar') → true
 */
function podeFazer(perfil, acao) {
    const nivelNecessario = PERMISSOES[acao];
    if (!nivelNecessario) return true;
    return (NIVEL[perfil] || 0) >= (NIVEL[nivelNecessario] || 99);
}

module.exports = { verPermissao, verSenhaAdmin, verificarSenhaSuperAdmin, podeFazer, PERMISSOES, NIVEL };