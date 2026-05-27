PRAGMA foreign_keys = ON;
 
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
 
    status BOOLEAN DEFAULT 1,
 
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE sensores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 
    usuario_id INTEGER NOT NULL,
 
    tipo TEXT NOT NULL,
    localizacao TEXT NOT NULL,
    status TEXT DEFAULT 'ativo',
 
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
 
CREATE TABLE leituras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 
    sensor_id INTEGER NOT NULL,
 
    temperatura REAL NOT NULL,
    umidade REAL NOT NULL,
 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 
    FOREIGN KEY (sensor_id) REFERENCES sensores(id) ON DELETE CASCADE
);
 
CREATE TABLE logs_sistema (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 
    tipo_evento TEXT NOT NULL,
    tabela_afetada TEXT NOT NULL,
 
    registro_id INTEGER,
    usuario_id INTEGER,
 
    descricao TEXT,
    dados_anteriores TEXT,
    dados_novos TEXT,
 
    data_log DATETIME DEFAULT CURRENT_TIMESTAMP,
 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
 
-- ============================================
-- TRIGGERS PARA AUTOMATIZAÇÃO
-- ============================================
 
-- Trigger: Atualizar updated_at em usuarios
CREATE TRIGGER trg_usuarios_updated_at
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    UPDATE usuarios SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;
 
-- Trigger: Atualizar updated_at em sensores
CREATE TRIGGER trg_sensores_updated_at
AFTER UPDATE ON sensores
FOR EACH ROW
BEGIN
    UPDATE sensores SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;
 
-- Trigger: Atualizar updated_at em leituras
CREATE TRIGGER trg_leituras_updated_at
AFTER UPDATE ON leituras
FOR EACH ROW
BEGIN
    UPDATE leituras SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;
 
-- Trigger: Log ao criar novo usuário
CREATE TRIGGER trg_log_usuario_criado
AFTER INSERT ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_novos)
    VALUES ('INSERT', 'usuarios', NEW.id, 'Novo usuário criado: ' || NEW.nome, 
            'ID: ' || NEW.id || ', Email: ' || NEW.email);
END;
 
-- Trigger: Log ao atualizar status do usuário
CREATE TRIGGER trg_log_usuario_status
AFTER UPDATE ON usuarios
FOR EACH ROW
WHEN OLD.status != NEW.status
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, usuario_id, descricao, dados_anteriores, dados_novos)
    VALUES ('UPDATE', 'usuarios', NEW.id, NEW.id, 
            'Status do usuário alterado', 
            'Status: ' || OLD.status, 
            'Status: ' || NEW.status);
END;
 
-- Trigger: Log ao criar novo sensor
CREATE TRIGGER trg_log_sensor_criado
AFTER INSERT ON sensores
FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, usuario_id, descricao, dados_novos)
    VALUES ('INSERT', 'sensores', NEW.id, NEW.usuario_id, 
            'Novo sensor registrado: ' || NEW.tipo || ' em ' || NEW.localizacao,
            'ID: ' || NEW.id || ', Tipo: ' || NEW.tipo || ', Localização: ' || NEW.localizacao);
END;
 
-- Trigger: Log ao alterar status do sensor
CREATE TRIGGER trg_log_sensor_status
AFTER UPDATE ON sensores
FOR EACH ROW
WHEN OLD.status != NEW.status
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, usuario_id, descricao, dados_anteriores, dados_novos)
    VALUES ('UPDATE', 'sensores', NEW.id, NEW.usuario_id,
            'Status do sensor alterado',
            'Status: ' || OLD.status,
            'Status: ' || NEW.status);
END;
 
-- Trigger: Log ao deletar sensor
CREATE TRIGGER trg_log_sensor_deletado
AFTER DELETE ON sensores
FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, usuario_id, descricao)
    VALUES ('DELETE', 'sensores', OLD.id, OLD.usuario_id,
            'Sensor removido: ' || OLD.tipo || ' (ID: ' || OLD.id || ')');
END;
 
-- Trigger: Alertar quando temperatura estiver acima de 30°C
CREATE TRIGGER trg_log_alerta_temperatura
AFTER INSERT ON leituras
FOR EACH ROW
WHEN NEW.temperatura > 30.0
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_novos)
    VALUES ('ALERTA', 'leituras', NEW.sensor_id,
            'AVISO: Temperatura alta detectada!',
            'Sensor ID: ' || NEW.sensor_id || ', Temperatura: ' || NEW.temperatura || '°C');
END;
 
-- Trigger: Alertar quando umidade estiver acima de 80%
CREATE TRIGGER trg_log_alerta_umidade
AFTER INSERT ON leituras
FOR EACH ROW
WHEN NEW.umidade > 80.0
BEGIN
    INSERT INTO logs_sistema (tipo_evento, tabela_afetada, registro_id, descricao, dados_novos)
    VALUES ('ALERTA', 'leituras', NEW.sensor_id,
            'AVISO: Umidade alta detectada!',
            'Sensor ID: ' || NEW.sensor_id || ', Umidade: ' || NEW.umidade || '%');
END;
 
