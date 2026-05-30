#include "conexao.h"
#include "sensores.h"

unsigned long ultimoEnvio = 0;
const long intervalo      = 5000;

void enviarDados() {
    float temperatura = lerTemperatura();
    float umidade     = lerUmidade();
    float ar          = lerMQ135();
    float CO          = lerMonoxidoCarbono();

    // não envia se o DHT22 falhou
    if (temperatura == -1 || umidade == -1) return;

    StaticJsonDocument<256> doc; // ← aumentado para caber todos os campos
    doc["temperatura"] = temperatura;
    doc["umidade"]     = umidade;
    doc["gases"] = ar;
    doc["CO"]          = CO;

    String json;
    serializeJson(doc, json);

    ws.sendTXT(json);
    Serial.println("Enviado: " + json);
}

void setup() {
    Serial.begin(115200);
    iniciarSensores(); // ← inicializa DHT22
    iniciarConexao();
}

void loop() {
    ws.loop();

    unsigned long agora = millis();

    if (agora - ultimoEnvio >= intervalo) {
        ultimoEnvio = agora;
        enviarDados();
    }
}





