#include <dummy.h>
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_MLX90614.h>
#include <WebServer.h>
#include <MAX30105.h>
#include "heartRate.h"  // Comes with SparkFun library
#define MQ3_PIN 34

Adafruit_MLX90614 mlx = Adafruit_MLX90614();
MAX30105 particleSensor;
WebServer server(80);

const char* ssid = "LABIB 1";
const char* password = "09*hasan2";

long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

float calculateSpO2(long red, long ir) {
  if (red < 10000 || ir < 10000) return 0; // no finger
  float ratio = (float)red / (float)ir;
  float spO2 = 110.0 - 25.0 * ratio;

  if (spO2 > 100) spO2 = 100;
  if (spO2 < 0) spO2 = 0;
  return spO2;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();

  // Temp sensor
  if (!mlx.begin()) {
    Serial.println("MLX90614 not found!");
    while (1);
  }
//max30102 sensor 
  // MAX30102 sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("MAX30102 not found!");
    while (1);
  }

  particleSensor.setup();  // Default config
  particleSensor.setPulseAmplitudeRed(0x1F);
  particleSensor.setPulseAmplitudeIR(0x1F);
  particleSensor.setPulseAmplitudeGreen(0);  // green off

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

  // API endpoint
  server.on("/data", HTTP_GET, []() {
    float temperature = mlx.readObjectTempC();
    int alcoholRaw = analogRead(MQ3_PIN);
    float alcoholPercent = map(alcoholRaw, 0, 4095, 0, 100);

    long irValue = particleSensor.getIR();
    long redValue = particleSensor.getRed();

    // Pulse
    bool beatDetected = checkForBeat(irValue);
    if (beatDetected) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      beatsPerMinute = 60 / (delta / 1000.0);
      if (beatsPerMinute > 20 && beatsPerMinute < 255) {
        beatAvg = (beatAvg * 3 + beatsPerMinute) / 4;
      }
    }

    // SpO2
    float spO2 = calculateSpO2(redValue, irValue);

    // JSON response
    String json = "{";
    json += "\"bodyTemp\":" + String(temperature, 2) + ",";
    json += "\"alcoholLevel\":" + String(alcoholPercent, 2) + ",";
    json += "\"pulseRaw\":" + String(irValue) + ",";
    json += "\"redRaw\":" + String(redValue) + ",";
    json += "\"spO2\":" + String(spO2, 2) + ",";
    json += "\"pulseRate\":" + String(beatAvg) + ",";
    json += "\"beatDetected\":" + String(beatDetected ? "true" : "false");
    json += "}";

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", json);
  });

  server.begin();
}

void loop() {
  server.handleClient();
  delay(10);
}