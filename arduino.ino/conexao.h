#ifndef CONEXAO_H
#define CONEXAO_H
#define ESTACAO_ID 1

#include <WiFi.h>
#include <ArduinoJson.h>

#include <WebSocketsClient.h>


const char* ssid       = "";
const char* password   = "";
const char* serverIp   = "";
const int   serverPort = ;


WebSocketsClient ws;


void comandosDoSistema(String msg);


void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_CONNECTED:
            Serial.println("Conectado ao servidor!");
            break;
        case WStype_DISCONNECTED:
            Serial.println("Desconectado!");
            break;
        case WStype_TEXT:
            Serial.println("Servidor disse: " + String((char*)payload));
            comandosDoSistema(String((char*)payload));
            break;
    }
}

void iniciarConexao() {
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi conectado!");

    String path = "/?tipo=esp32&estacao=" + String(ESTACAO_ID);
    ws.begin(serverIp, serverPort, path.c_str()); 
    ws.onEvent(onWebSocketEvent);
    ws.setReconnectInterval(5000);
}

#endif