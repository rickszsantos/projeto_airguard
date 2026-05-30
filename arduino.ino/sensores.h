#ifndef SENSORES_H
#define SENSORES_H
#include <DHT.h>

#define PINO_DHT    4   // DHT22 — temperatura e umidade
#define PINO_MQ135  32  // MQ135 — qualidade do ar geral
#define PINO_MQ7    33  // MQ7   — monóxido de carbono (CO)
#define TIPO_DHT    DHT22

DHT dht(PINO_DHT, TIPO_DHT);

void iniciarSensores() {
    dht.begin();
}

float lerTemperatura() {
    float temp = dht.readTemperature();

    if (isnan(temp)) {
        Serial.println("Erro ao ler temperatura do DHT22!");
        return -1;
    }

    return temp;
}

float lerUmidade() {
    float umidade = dht.readHumidity();

    if (isnan(umidade)) {
        Serial.println("Erro ao ler umidade do DHT22!");
        return -1;
    }

    return umidade;
}

float lerMonoxidoCarbono() {
    int leitura = analogRead(PINO_MQ7);

    Serial.print("MQ7 (raw): ");
    Serial.println(leitura);

    float ppm = map(leitura, 0, 4095, 0, 1000); // ← igual ao MQ135
    return ppm;
}

float lerMQ135() {
    int leitura = analogRead(PINO_MQ135);

    Serial.print("MQ135 (raw): ");
    Serial.println(leitura);

    float ppm = map(leitura, 0, 4095, 0, 1000);
    return ppm;
}

#endif