const db = require('../config/database');
class Usuario {



    // Salva novo usuário no banco
  salvarUser(nome, email, senha) {
    const stmt = db.prepare(`
      INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)
    `);
    const resultado = stmt.run(nome, email, senha);
    return { id: resultado.lastInsertRowid, nome, email };
  }




  // Verifica se email já existe
  emailExiste(email) {
    const stmt = db.prepare('SELECT id FROM usuarios WHERE email = ?');
    return stmt.get(email) ? true : false;
  }




  // Busca usuário pelo email (usado no login)
  buscarPorEmail(email) {
    const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
    return stmt.get(email) || null;
  }




  
    
}
module.exports = new Usuario();
