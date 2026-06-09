#include "conexao.h"
#include "sensores.h"

unsigned long ultimoEnvio = 0;
const long intervalo      = 5000;
bool leituraAtiva = true;


void comandosDoSistema(String msg) {


    StaticJsonDocument<128> doc;
    deserializeJson(doc, msg);

    String comando = doc["comando"] | "";

    if (comando == "PARAR_LEITURA") {
        leituraAtiva = false;
        Serial.println("Leitura PAUSADA");
    }

    if (comando == "INICIAR_LEITURA") {
        leituraAtiva = true;
        Serial.println("Leitura RETOMADA");
    }


}
















void enviarDados() {
    if(!leituraAtiva) return;
    float temperatura = lerTemperatura();
    float umidade     = lerUmidade();
    float ar          = lerMQ135();
    float CO          = lerMonoxidoCarbono();

    // não envia se o DHT22 falhou
    if (temperatura == -1 || umidade == -1) return;

    StaticJsonDocument<256> doc; 
    doc["temperatura"] = temperatura;
    doc["umidade"]     = umidade;
    doc["gases"] = ar;
    doc["CO"]          = CO;
    doc["estacao_id"] = ESTACAO_ID;

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