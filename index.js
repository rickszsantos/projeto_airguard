require('dotenv').config();
const porta = process.env.PORT;
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


const app = express(); // "init"
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*"}});



const authRoutes = require("./src/routes/authRoutes");
const sensorRoutes = require("./src/routes/sensorRoutes");




app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));



//renderizar as telas e carregar a pasta de viws
app.set("view engine", "ejs");
app.set("views", "./src/views");
//rotas
app.use("/", authRoutes);
app.use("/api", sensorRoutes);



io.on('connection', (socket) => {
    console.log('ESP32 conectado!');

    socket.on('leitura', (dado) => {
        // recebe do ESP32
        sensorController.receberDados(dado);

        // repassa para o browser em tempo real
        io.emit('novaLeitura', dado);
    });

    socket.on('disconnect', () => {
        console.log('ESP32 desconectado');
    });
});









server.listen(porta, () => {
  console.log("Servidor rodando");
});


module.exports = app;