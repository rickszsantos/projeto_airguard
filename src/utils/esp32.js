let conexao_esp32 = null;

function setConexaoESP32(ws) {
    conexao_esp32 = ws;
}

function enviarESP32(comando) {
    if (conexao_esp32 && conexao_esp32.readyState === 1) {
        conexao_esp32.send(JSON.stringify(comando));
        console.log('Comando enviado ao ESP32:', comando);
    } else {
        console.log('ESP32 não conectado — comando ignorado');
    }
}

module.exports = { setConexaoESP32, enviarESP32 };