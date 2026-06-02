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
 


wss.on('connection', (ws) => {
  console.log('ESP32 conectado!');
 
  ws.on('message', (msg) => {
    try {
      const dado = JSON.parse(msg);
      console.log('recebido:', dado);
 
      const req = { body: dado };
      const res = {
        status: (code) => ({ json: (data) => console.log(`status ${code}:`, data) }),
        json: (data) => console.log('resposta:', data)
      };
 
      LeituraController.receberDados(req, res);
    } catch (e) {
      console.error('Mensagem inválida do ESP32:', e.message);
    }
  });
 
  ws.on('close', () => console.log('ESP32 desconectado'));
});
 





const PORTA = process.env.PORT || 3000;
server.listen(PORTA, () => {
  console.log(`✅ AirGuard rodando em http://localhost:${PORTA}`);
});
 



module.exports = app;
 