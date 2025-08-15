#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <math.h>

// ==== กำหนด ID ของอุปกรณ์ (ต้องตรงกับ device_id ใน DB) ====
#define DEVICE_ID 42

// กำหนดค่า WiFi
const char* ssid     = "TP-Link_61E3_2.4";
const char* password = "0800453956";

// MQTT Broker Settings (Edge Server)
const char* mqtt_server   = "192.168.1.104";
const int   mqtt_port     = 1883;
const char* mqtt_user     = "admin";
const char* mqtt_password = "admin1234";

// sensor pin และวงจร NTC
const int sensorPin = A0;
const float R_FIXED = 100000.0;  // 100kΩ
const float BETA    = 3700.0;
const float T0      = 298.15;    // 25°C in Kelvin
const float R0      = 280000.0;  // resistance at 25°C

WiFiClient    espClient;
PubSubClient  client(espClient);

unsigned long lastReadTime    = 0;
const unsigned long interval  = 10000;  // 10 วินาที

void setup_wifi() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected, IP: " + WiFi.localIP().toString());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "sensor-client-";
    clientId += DEVICE_ID;
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retry in 5s");
      delay(5000);
    }
  }
}

float readTemperatureC() {
  int adc = analogRead(sensorPin);
  float voltage = adc * (3.3 / 1023.0);
  if (voltage < 0.01) return NAN;

  float resistance = R_FIXED * ((1.0 / voltage) - 1.0);
  float tempK = 1.0 / ((1.0 / T0) + (1.0 / BETA) * log(resistance / R0));
  return tempK - 273.15;
}

void setup() {
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();
  if (now - lastReadTime < interval) return;
  lastReadTime = now;

  float tempC = readTemperatureC();
  if (isnan(tempC)) {
    Serial.println("Sensor read error");
    return;
  }

  // สร้าง topic เป็น "sensor/{deviceId}/data"
  char topic[32];
  snprintf(topic, sizeof(topic), "sensor/%d/data", DEVICE_ID);

  // สร้าง payload JSON: {"metric":"temperature","value":23.45}
  char payload[64];
  snprintf(payload, sizeof(payload),
           "{\"metric\":\"temperature\",\"value\":%.2f}", tempC);

  // ส่ง MQTT
  if (client.publish(topic, payload)) {
    Serial.printf("Published to %s: %s\n", topic, payload);
  } else {
    Serial.println("Publish failed");
  }
}