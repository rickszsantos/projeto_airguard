#ifndef CONEXAO_H
#define CONEXAO_H

#include <WiFi.h>
#include <ArduinoJson.h>

#include <WebSocketsClient.h>


const char* ssid       = "nome da rede";
const char* password   = "senha";
const char* serverIp   = "ip";
const int   serverPort = porta;


WebSocketsClient ws;  // ← troca SocketIOclient por WebSocketsClient

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
            break;
    }
}

void iniciarConexao() {
    WiFi.begin(ssid, password);
    Serial.print("Conectando no WiFi");

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi conectado!");

    ws.begin(serverIp, serverPort, "/");  // ← caminho simples
    ws.onEvent(onWebSocketEvent);
    ws.setReconnectInterval(5000);
}

#endif