#include <TinyGPS++.h>
#include <HardwareSerial.h>

// Initialize the TinyGPS++ object
TinyGPSPlus gps;

// Use HardwareSerial1 on ESP32 (for better performance)
HardwareSerial mySerial(1);

void setup() {
  // Start the serial communication with the computer
  Serial.begin(115200);
  
  // Start communication with the GPS module (9600 baud)
  mySerial.begin(9600, SERIAL_8N1, 16, 17);  // GPS TX to ESP32 RX (GPIO16), GPS RX to ESP32 TX (GPIO17)

  Serial.println("GPS TEST STARTED...");
}

void loop() {
  // Read the incoming data from GPS module and feed it to the TinyGPS++ library
  while (mySerial.available()) {
    gps.encode(mySerial.read());
    
    // Once a GPS fix is available, print the latitude and longitude in a pretty format
    if (gps.location.isUpdated()) {
      // Print latitude and longitude in a nice format
      Serial.print("Latitude: ");
      Serial.println(gps.location.lat(), 6);  // Print latitude with 6 decimal places
      Serial.print("Longitude: ");
      Serial.println(gps.location.lng(), 6);  // Print longitude with 6 decimal places
    }
  }
}
