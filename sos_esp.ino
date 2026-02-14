#include <WiFi.h>

// Replace with your Wi-Fi credentials
const char* ssid = "LABIB 1";
const char* password = "09*hasan2";

// Define the GPIO pin connected to the SOS button (GPIO 4 in this case)
const int buttonPin = 4;  // GPIO 4 (you can change this to any valid pin)

void setup() {
  Serial.begin(115200);
  
  // Set the button pin as an input with a pull-up resistor
  pinMode(buttonPin, INPUT_PULLUP);
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("WiFi connected.");
}

void loop() {
  // Check if the button is pressed
  if (digitalRead(buttonPin) == LOW) {  // Button pressed
    Serial.println("Help! SOS Button Pressed.");
    delay(2000);  // Delay to avoid multiple triggers
  }
}
