CREATE TABLE usuarios (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,

    nome         TEXT    NOT NULL,
    email        TEXT    NOT NULL UNIQUE,
    senha        TEXT    NOT NULL,

    perfil       TEXT    NOT NULL DEFAULT 'funcionario'
                         CHECK (perfil IN ('superadmin', 'admin', 'funcionario')),

    status       BOOLEAN NOT NULL DEFAULT 1,

    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE estacoes (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,

    nome               TEXT    NOT NULL,
    descricao          TEXT,

    latitude           REAL,
    longitude          REAL,

    intervalo_leitura  INTEGER NOT NULL DEFAULT 5000,  -- milissegundos

    status             TEXT    NOT NULL DEFAULT 'ativa'
                               CHECK (status IN ('ativa', 'inativa', 'manutencao')),

    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE sensores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,

    estacao_id  INTEGER NOT NULL,

    tipo        TEXT    NOT NULL
                        CHECK (tipo IN ('DHT22', 'MQ7', 'MQ135')),

    descricao   TEXT,

    status      TEXT    NOT NULL DEFAULT 'ativo'
                        CHECK (status IN ('ativo', 'inativo', 'defeito')),

    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (estacao_id) REFERENCES estacoes(id) ON DELETE CASCADE
);



CREATE TABLE leituras (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,

    sensor_id   INTEGER NOT NULL,

    valor       REAL    NOT NULL,
    unidade     TEXT    NOT NULL
                        CHECK (unidade IN ('°C', '%', 'ppm')),

    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sensor_id) REFERENCES sensores(id) ON DELETE CASCADE
);



CREATE TABLE historico (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,

    estacao_id      INTEGER NOT NULL,

    temperatura     REAL,
    umidade         REAL,
    co_ppm          REAL,
    gases_ppm       REAL,
    indice_ar       REAL,   -- 0-100, calculado pelo backend

    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (estacao_id) REFERENCES estacoes(id) ON DELETE CASCADE
);



CREATE TABLE alertas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,

    estacao_id    INTEGER NOT NULL,
    sensor_id     INTEGER,

    tipo          TEXT    NOT NULL
                          CHECK (tipo IN (
                              'TEMP_ALTA',
                              'TEMP_CRITICA',
                              'UMIDADE_ALTA',
                              'CO_ATENCAO',
                              'CO_CRITICO',
                              'GASES_ATENCAO',
                              'GASES_CRITICO'
                          )),

    mensagem      TEXT    NOT NULL,
    valor         REAL    NOT NULL,

    resolvido     BOOLEAN NOT NULL DEFAULT 0,
    resolvido_por INTEGER,       -- usuario_id que resolveu
    resolvido_em  DATETIME,

    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (estacao_id)    REFERENCES estacoes(id)  ON DELETE CASCADE,
    FOREIGN KEY (sensor_id)     REFERENCES sensores(id)  ON DELETE SET NULL,
    FOREIGN KEY (resolvido_por) REFERENCES usuarios(id)  ON DELETE SET NULL
);



CREATE TABLE logs_sistema (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,

    tipo_evento      TEXT    NOT NULL
                             CHECK (tipo_evento IN (
                                 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
                             )),

    tabela_afetada   TEXT    NOT NULL,
    registro_id      INTEGER,

    usuario_id       INTEGER,   -- quem executou

    descricao        TEXT,
    dados_anteriores TEXT,
    dados_novos      TEXT,

    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);



-- SEED: primeiro superadmin
-- Senha: airguard@2025 (trocar depois)
INSERT INTO usuarios (nome, email, senha, perfil)
VALUES (
    'Super Admin',
    'superadmin@airguard.com',
    '$2b$10$kANTBy78fiaLyOzROlmZCuOweo8poXUyq6l1ULGFGfZmGTO4Y5V7m',
    'superadmin'
);



-- TRIGGERS — updated_at automático para logs
-- leituras e historico são imutáveis — sem updated_at

CREATE TRIGGER trg_usuarios_updated_at
AFTER UPDATE ON usuarios FOR EACH ROW
BEGIN
    UPDATE usuarios SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_estacoes_updated_at
AFTER UPDATE ON estacoes FOR EACH ROW
BEGIN
    UPDATE estacoes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_sensores_updated_at
AFTER UPDATE ON sensores FOR EACH ROW
BEGIN
    UPDATE sensores SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;




-- Novo usuário criado
CREATE TRIGGER trg_log_usuario_criado
AFTER INSERT ON usuarios FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_novos)
    VALUES (
        'INSERT', 'usuarios', NEW.id,
        'Novo usuário criado: ' || NEW.nome,
        'Email: ' || NEW.email || ', Perfil: ' || NEW.perfil
    );
END;

-- Perfil ou status alterado (somente superadmin altera perfil)
CREATE TRIGGER trg_log_usuario_atualizado
AFTER UPDATE ON usuarios FOR EACH ROW
WHEN OLD.status != NEW.status OR OLD.perfil != NEW.perfil
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_anteriores, dados_novos)
    VALUES (
        'UPDATE', 'usuarios', NEW.id,
        'Usuário atualizado: ' || NEW.nome,
        'Status: ' || OLD.status || ', Perfil: ' || OLD.perfil,
        'Status: ' || NEW.status || ', Perfil: ' || NEW.perfil
    );
END;




-- Nova estação criada
CREATE TRIGGER trg_log_estacao_criada
AFTER INSERT ON estacoes FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_novos)
    VALUES (
        'INSERT', 'estacoes', NEW.id,
        'Nova estação cadastrada: ' || NEW.nome,
        'Lat: ' || COALESCE(NEW.latitude, 'N/A') ||
        ', Lng: ' || COALESCE(NEW.longitude, 'N/A') ||
        ', Intervalo: ' || NEW.intervalo_leitura || 'ms'
    );
END;

-- Intervalo de leitura alterado (ação de admin/superadmin)
CREATE TRIGGER trg_log_intervalo_alterado
AFTER UPDATE ON estacoes FOR EACH ROW
WHEN OLD.intervalo_leitura != NEW.intervalo_leitura
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_anteriores, dados_novos)
    VALUES (
        'UPDATE', 'estacoes', NEW.id,
        'Intervalo de leitura alterado: ' || NEW.nome,
        'Intervalo: ' || OLD.intervalo_leitura || 'ms',
        'Intervalo: ' || NEW.intervalo_leitura || 'ms'
    );
END;

-- Status da estação alterado
CREATE TRIGGER trg_log_estacao_status
AFTER UPDATE ON estacoes FOR EACH ROW
WHEN OLD.status != NEW.status
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_anteriores, dados_novos)
    VALUES (
        'UPDATE', 'estacoes', NEW.id,
        'Status da estação alterado: ' || NEW.nome,
        'Status: ' || OLD.status,
        'Status: ' || NEW.status
    );
END;



-- Novo sensor cadastrado
CREATE TRIGGER trg_log_sensor_criado
AFTER INSERT ON sensores FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_novos)
    VALUES (
        'INSERT', 'sensores', NEW.id,
        'Novo sensor cadastrado: ' || NEW.tipo,
        'Estação ID: ' || NEW.estacao_id || ', Tipo: ' || NEW.tipo
    );
END;

-- Status do sensor alterado
CREATE TRIGGER trg_log_sensor_status
AFTER UPDATE ON sensores FOR EACH ROW
WHEN OLD.status != NEW.status
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_anteriores, dados_novos)
    VALUES (
        'UPDATE', 'sensores', NEW.id,
        'Status do sensor alterado: ' || NEW.tipo,
        'Status: ' || OLD.status,
        'Status: ' || NEW.status
    );
END;

-- Sensor deletado
CREATE TRIGGER trg_log_sensor_deletado
AFTER DELETE ON sensores FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao)
    VALUES (
        'DELETE', 'sensores', OLD.id,
        'Sensor removido: ' || OLD.tipo || ' da estação ID ' || OLD.estacao_id
    );
END;



-- Temperatura alta: 30°C < valor <= 40°C
CREATE TRIGGER trg_alerta_temp_alta
AFTER INSERT ON leituras FOR EACH ROW
WHEN NEW.unidade = '°C' AND NEW.valor > 30.0 AND NEW.valor <= 40.0
BEGIN
    INSERT INTO alertas (estacao_id, sensor_id, tipo, mensagem, valor)
    SELECT s.estacao_id, NEW.sensor_id,
           'TEMP_ALTA',
           'Temperatura elevada: ' || NEW.valor || '°C',
           NEW.valor
    FROM sensores s WHERE s.id = NEW.sensor_id;
END;

-- Temperatura crítica: valor > 40°C
CREATE TRIGGER trg_alerta_temp_critica
AFTER INSERT ON leituras FOR EACH ROW
WHEN NEW.unidade = '°C' AND NEW.valor > 40.0
BEGIN
    INSERT INTO alertas (estacao_id, sensor_id, tipo, mensagem, valor)
    SELECT s.estacao_id, NEW.sensor_id,
           'TEMP_CRITICA',
           'CRÍTICO: Temperatura perigosa: ' || NEW.valor || '°C',
           NEW.valor
    FROM sensores s WHERE s.id = NEW.sensor_id;
END;

-- Umidade alta: valor > 80%
CREATE TRIGGER trg_alerta_umidade_alta
AFTER INSERT ON leituras FOR EACH ROW
WHEN NEW.unidade = '%' AND NEW.valor > 80.0
BEGIN
    INSERT INTO alertas (estacao_id, sensor_id, tipo, mensagem, valor)
    SELECT s.estacao_id, NEW.sensor_id,
           'UMIDADE_ALTA',
           'Umidade elevada: ' || NEW.valor || '%',
           NEW.valor
    FROM sensores s WHERE s.id = NEW.sensor_id;
END;

-- CO atenção: 200 < valor <= 400 ppm (MQ7)
CREATE TRIGGER trg_alerta_co_atencao
AFTER INSERT ON leituras FOR EACH ROW
WHEN NEW.unidade = 'ppm' AND NEW.valor > 200.0 AND NEW.valor <= 400.0
BEGIN
    INSERT INTO alertas (estacao_id, sensor_id, tipo, mensagem, valor)
    SELECT s.estacao_id, NEW.sensor_id,
           'CO_ATENCAO',
           'Nível de CO em atenção: ' || NEW.valor || ' ppm',
           NEW.valor
    FROM sensores s WHERE s.id = NEW.sensor_id AND s.tipo = 'MQ7';
END;

-- CO crítico: valor > 400 ppm (MQ7)
CREATE TRIGGER trg_alerta_co_critico
AFTER INSERT ON leituras FOR EACH ROW
WHEN NEW.unidade = 'ppm' AND NEW.valor > 400.0
BEGIN
    INSERT INTO alertas (estacao_id, sensor_id, tipo, mensagem, valor)
    SELECT s.estacao_id, NEW.sensor_id,
           'CO_CRITICO',
           'CRÍTICO: CO perigoso: ' || NEW.valor || ' ppm — Ventile imediatamente!',
           NEW.valor
    FROM sensores s WHERE s.id = NEW.sensor_id AND s.tipo = 'MQ7';
END;

-- Gases atenção: 400 < valor <= 800 ppm (MQ135)
CREATE TRIGGER trg_alerta_gases_atencao
AFTER INSERT ON leituras FOR EACH ROW
WHEN NEW.unidade = 'ppm' AND NEW.valor > 400.0 AND NEW.valor <= 800.0
BEGIN
    INSERT INTO alertas (estacao_id, sensor_id, tipo, mensagem, valor)
    SELECT s.estacao_id, NEW.sensor_id,
           'GASES_ATENCAO',
           'Gases em atenção: ' || NEW.valor || ' ppm',
           NEW.valor
    FROM sensores s WHERE s.id = NEW.sensor_id AND s.tipo = 'MQ135';
END;

-- Gases crítico: valor > 800 ppm (MQ135)
CREATE TRIGGER trg_alerta_gases_critico
AFTER INSERT ON leituras FOR EACH ROW
WHEN NEW.unidade = 'ppm' AND NEW.valor > 800.0
BEGIN
    INSERT INTO alertas (estacao_id, sensor_id, tipo, mensagem, valor)
    SELECT s.estacao_id, NEW.sensor_id,
           'GASES_CRITICO',
           'CRÍTICO: Gases perigosos: ' || NEW.valor || ' ppm — Acione a equipe!',
           NEW.valor
    FROM sensores s WHERE s.id = NEW.sensor_id AND s.tipo = 'MQ135';
END;
 
