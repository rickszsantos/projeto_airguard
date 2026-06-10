
function runMigrations(db) {
    // Garante que a tabela de controle de migrações existe
    db.exec(`
        CREATE TABLE IF NOT EXISTS _migracoes (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            nome      TEXT    NOT NULL UNIQUE,
            aplicada_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const jaAplicada = (nome) =>
        !!db.prepare('SELECT id FROM _migracoes WHERE nome = ?').get(nome);

    const marcar = (nome) =>
        db.prepare('INSERT INTO _migracoes (nome) VALUES (?)').run(nome);

    // ── Migração 001: estacoes.status aceitar 'arquivada' ──────────────────────
    if (!jaAplicada('001_estacoes_status_arquivada')) {
        db.transaction(() => {
            // SQLite não permite ALTER COLUMN, então recriamos a tabela
            db.exec(`
                -- Cria tabela temporária com o novo CHECK
                CREATE TABLE estacoes_new (
                    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome               TEXT    NOT NULL,
                    descricao          TEXT,
                    latitude           REAL,
                    longitude          REAL,
                    intervalo_leitura  INTEGER NOT NULL DEFAULT 5000,
                    status             TEXT    NOT NULL DEFAULT 'ativa'
                                               CHECK (status IN ('ativa', 'inativa', 'manutencao', 'arquivada')),
                    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                -- Copia todos os dados existentes
                INSERT INTO estacoes_new
                    SELECT id, nome, descricao, latitude, longitude,
                           intervalo_leitura, status, created_at, updated_at
                    FROM estacoes;

                -- Remove a tabela antiga e renomeia a nova
                DROP TABLE estacoes;
                ALTER TABLE estacoes_new RENAME TO estacoes;
            `);
        })();
        marcar('001_estacoes_status_arquivada');
        console.log('[migrate] 001_estacoes_status_arquivada aplicada.');
    }

    // ── Migração 002: foto_perfil nos usuários (se não existir) ───────────────
    if (!jaAplicada('002_usuarios_foto_perfil')) {
        try {
            db.exec(`ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT`);
        } catch (e) {
            // coluna já existe — ignora
        }
        marcar('002_usuarios_foto_perfil');
        console.log('[migrate] 002_usuarios_foto_perfil aplicada.');
    }
}

module.exports = runMigrations;
