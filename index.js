require('dotenv').config();
 
const express = require('express');
const http    = require('http');
const session = require('express-session');     
const { WebSocketServer } = require('ws');
 
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });
 
const authRoutes       = require('./src/routes/authRoutes');
const sensorRoutes     = require('./src/routes/sensorRoutes');
const sensorController = require('./src/controllers/sensorController');
 
sensorController.setWss(wss);
 

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
app.use('/', authRoutes);
app.use('/api', sensorRoutes);
 







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
 
      sensorController.receberDados(req, res);
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
 