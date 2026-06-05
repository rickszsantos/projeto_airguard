const conexoes = new Map();

function setConexaoESP32(estacaoId, ws) {
    conexoes.set(estacaoId, ws);
    console.log(`ESP32 estação ${estacaoId} registrado`);
}

function removerConexaoESP32(estacaoId) {
    conexoes.delete(estacaoId);
    console.log(`ESP32 estação ${estacaoId} desconectado`);
}

function enviarESP32(estacaoId, comando) {
    const ws = conexoes.get(estacaoId);
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(comando));

        if (comando.comando === 'INICIAR_LEITURA') {
            console.log(`Comando enviado — estação ${estacaoId} ativada`);
        } else {
            console.log(`Comando enviado — estação ${estacaoId} desativada`);
        }

    } else {
        console.log(`ESP32 estação ${estacaoId} não conectado`);
    }
}

module.exports = { setConexaoESP32, removerConexaoESP32, enviarESP32 };