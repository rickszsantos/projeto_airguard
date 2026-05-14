require('dotenv').config();
const porta   = process.env.PORT;
const express = require('express');
const http    = require('http');
const { WebSocketServer } = require('ws');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

const authRoutes       = require('./src/routes/authRoutes');
const sensorRoutes     = require('./src/routes/sensorRoutes');
const sensorController = require('./src/controllers/sensorController');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use('/', authRoutes);
app.use('/api', sensorRoutes);



wss.on('connection', (ws) => {
    console.log('ESP32 conectado!');

    ws.on('message', (msg) => {
        const dado = JSON.parse(msg);
        console.log('recebido:', dado);

        const req = { body: dado };
        const res = {
            status: (code) => ({
                json: (data) => console.log(`status ${code}:`, data)
            }),
            json: (data) => console.log('resposta:', data)
        };

        sensorController.receberDados(req, res);

        // repassa para todos conectados (browser/dashboard)
        wss.clients.forEach((client) => {
            client.send(JSON.stringify(dado));
        });
    });

    ws.on('close', () => {
        console.log('ESP32 desconectado');
    });
});




server.listen(porta, () => {
    console.log('Servidor rodando na porta', porta);
});

module.exports = app;