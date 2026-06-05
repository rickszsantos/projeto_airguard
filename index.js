//cria o banco caso não tenha
const fs   = require('fs');
const path = require('path');

const dbPath  = path.join(__dirname, 'database/banco.db');
const sqlPath = path.join(__dirname, 'database/base.sql');

if (!fs.existsSync(dbPath)) {
  console.log('Banco não encontrado, criando...');
  const Database = require('better-sqlite3');
  const sql      = fs.readFileSync(sqlPath, 'utf8');
  const db       = new Database(dbPath);
  db.exec(sql);
  console.log('Banco criado com sucesso!');
}
//--

require('dotenv').config();
 
const express = require('express');
const http    = require('http');
const session = require('express-session');     
const { WebSocketServer } = require('ws');
 
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });
 
const AuthRoutes       = require('./src/routes/AuthRoutes');
const LeituraRoutes     = require('./src/routes/LeituraRoutes');
const EstacaoRoutes     = require('./src/routes/EstacaoRoutes');
const LeituraController = require('./src/controllers/LeituraController');
 const { setConexaoESP32, enviarESP32 } = require('./src/utils/esp32');

 
LeituraController.setWss(wss);
 

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 

app.use(session({
  secret: process.env.SESSION_SECRET || 'airguard-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // sessão dura 1 dia
    secure: false                 // trocar para true em produção com HTTPS
  }
}));
 





// ── ejs ───────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', './src/views');
// ── Rotas ─────────────────────────────────────────────────────────────────
app.use('/', AuthRoutes);
app.use('/api', LeituraRoutes);
app.use('/api', EstacaoRoutes);
 









wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    ws._tipo  = url.searchParams.get('tipo') || 'dashboard';
    ws._estacao_id = parseInt(url.searchParams.get('estacao')) || null;

    if (ws._tipo === 'esp32' && ws._estacao_id) {
        setConexaoESP32(ws._estacao_id, ws); // ← usa o utils
        console.log(`ESP32 estação ${ws._estacao_id} conectado!`);

        ws.on('message', (msg) => {
            try {
                const dado    = JSON.parse(msg);
                const fakeReq = { body: dado };
                const fakeRes = {
                    status: (c) => ({ json: (d) => console.log(`[${c}]`, d) }),
                    json:   (d) => console.log('[resp]', d),
                };
                LeituraController.receberDados(fakeReq, fakeRes);
            } catch (e) { console.error('Msg inválida ESP32:', e.message); }
        });

        ws.on('close', () => {
            removerConexaoESP32(ws._estacao_id);
        });
    } 
});












const PORTA = process.env.PORT || 3000;
server.listen(PORTA, () => {
  console.log(`AirGuard rodando em http://localhost:${PORTA}`);
});
 



module.exports = app;
module.exports = enviarESP32;
 