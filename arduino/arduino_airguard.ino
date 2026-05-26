#include "conexao.h"
#include "sensores.h"



unsigned long ultimoEnvio = 0;
const long intervalo      = 5000; 


void enviarDados() {
    float temperatura = lerTemperatura();
    float umidade     = lerUmidade();
    float ar          = lerMQ135();
    float co          = lerMonoxidoCarbono();


    if (temperatura == -1 || umidade == -1) return;

    StaticJsonDocument<256> doc;
    doc["temperatura"]  = temperatura;
    doc["umidade"]      = umidade;
    doc["qualidadeAr"]  = ar;
    doc["co"]           = co; // ← adiciona

    String json;
    serializeJson(doc, json);

    ws.sendTXT(json);
    Serial.println("Enviado: " + json);
}

void setup() {
    Serial.begin(115200);
    iniciarConexao();
}

void loop() {
    ws.loop(); // roda sempre, sem parar

    unsigned long agora = millis();

    if (agora - ultimoEnvio >= intervalo) {
        ultimoEnvio = agora;
        enviarDados(); // envia só a cada 5 segundos
    }
}





