const db = require('../config/database');

class Usuario {

  salvarUser(nome, email, senha) {
    const stmt = db.prepare('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)');
    const resultado = stmt.run(nome, email, senha);
    return { id: resultado.lastInsertRowid, nome, email };
  }






  emailExiste(email) {
    return !!db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  }





  buscarPorEmail(email) {
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email) || null;
  }





  buscarPorId(id) {
    return db.prepare('SELECT id, nome, email, perfil, status, created_at FROM usuarios WHERE id = ?').get(id) ?? null;
  }





  buscarSuperAdmin() {
    return db.prepare("SELECT * FROM usuarios WHERE perfil = 'superadmin' LIMIT 1").get() ?? null;
  }






  listarTodos() {
    return this.listar();
  }





  listar() {
    return db.prepare(`
      SELECT id, nome, email, perfil, status, created_at
      FROM usuarios
      ORDER BY
        CASE perfil WHEN 'superadmin' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END,
        nome ASC
    `).all();
  }





  atualizarPerfil(id, nome, email) {
    db.prepare('UPDATE usuarios SET nome=?, email=? WHERE id=?').run(nome, email, id);
  }





  atualizarSenha(id, senhaHash) {
    db.prepare('UPDATE usuarios SET senha=? WHERE id=?').run(senhaHash, id);
  }





  alterarPerfil(id, perfil) {
    db.prepare('UPDATE usuarios SET perfil=? WHERE id=?').run(perfil, id);
  }





  alterarStatus(id, status) {
    db.prepare('UPDATE usuarios SET status=? WHERE id=?').run(status, id);
  }


  atualizarFotoPerfil(id, caminhoFoto) {
    db.prepare('UPDATE usuarios SET foto_perfil=? WHERE id=?').run(caminhoFoto, id);
  }


  promover(id) {
    const u = this.buscarPorId(id);
    if (!u || u.perfil !== 'funcionario') return false;
    db.prepare("UPDATE usuarios SET perfil='admin' WHERE id=?").run(id);
    return true;
  }

  // Usuários não são excluídos — apenas desativados (status=0)
  desativar(id) {
    db.prepare('UPDATE usuarios SET status=0 WHERE id=?').run(id);
  }




}

module.exports = new Usuario();