#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <HardwareSerial.h>
#include <TinyGPS++.h>

// ---------------- WiFi & Firebase ----------------
#define WIFI_SSID "SIH"
#define WIFI_PASSWORD "sih@2024"

#define Web_API_KEY "AIzaSyDrvmtKo-H8J8YoEr245ldtn23H0chmP6U"
#define DATABASE_URL "https://continue-8d736-default-rtdb.firebaseio.com/"
#define USER_EMAIL "esp32@gmail.com"
#define USER_PASS "123456"

UserAuth user_auth(Web_API_KEY, USER_EMAIL, USER_PASS);
FirebaseApp app;
WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
RealtimeDatabase Database;

void processData(AsyncResult &aResult);

// ---------------- GPS ----------------
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// ---------------- Button & LED ----------------
int btnPin = 2;
int btnOld = 0;
int btnNew;
int redLed = 26;
int greenLed = 27;

// ---------------- Blinking control ----------------
bool blinkingActive = false;
unsigned long blinkStartTime = 0;
const unsigned long blinkDuration = 5000; // 5 sec
unsigned long lastBlinkToggle = 0;
bool redLedState = false;
bool altMode = false; // alternate red/green mode

// ---------------- Setup ----------------
void setup() {
  Serial.begin(9600);

  // Button and LEDs
  pinMode(btnPin, INPUT);
  pinMode(greenLed, OUTPUT);
  pinMode(redLed, OUTPUT);

  // GPS
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
  Serial.println("Serial 2 started at 9600 baud rate");
  Serial.println("Waiting for GPS data on UART2...");

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.println("Wi-Fi connected!");

  ssl_client.setInsecure();
  ssl_client.setConnectionTimeout(1000);
  ssl_client.setHandshakeTimeout(5);

  // Firebase
  initializeApp(aClient, app, getAuth(user_auth), processData, "🔐 authTask");
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
  Serial.println("Firebase initialized!");
}

// ---------------- Main Loop ----------------
void loop() {
  app.loop(); // Maintain Firebase auth

  btnNew = digitalRead(btnPin);

  // Detect button press (rising edge)
  if (btnOld == 0 && btnNew == 1) {
    Serial.println("Button Pressed");

    if (!blinkingActive) {
      // Start blinking on double press
      static int pressCount = 0;
      static unsigned long lastPressTime = 0;

      if (millis() - lastPressTime < 500) { // double press within 0.5 sec
        pressCount++;
      } else {
        pressCount = 1;
      }
      lastPressTime = millis();

      if (pressCount == 2) {
        blinkingActive = true;
        blinkStartTime = millis();
        lastBlinkToggle = millis();
        Serial.println("Red LED blinking started for 5 sec");
      }
    } else {
      // Already blinking → enter alternate mode
      altMode = true;
      Serial.println("Alternate LED mode ON -> Send Cancelled");
    }
  }
  btnOld = btnNew;

  // Handle blinking
  if (blinkingActive) {
    if (millis() - blinkStartTime <= blinkDuration) {
      if (!altMode) {
        // Normal red LED blinking
        if (millis() - lastBlinkToggle >= 500) {
          redLedState = !redLedState;
          digitalWrite(redLed, redLedState);
          digitalWrite(greenLed, LOW);
          lastBlinkToggle = millis();
        }
      } else {
        // Alternate mode (red-green)
        if (millis() - lastBlinkToggle >= 500) {
          redLedState = !redLedState;
          digitalWrite(redLed, redLedState);
          digitalWrite(greenLed, !redLedState);
          lastBlinkToggle = millis();
          Serial.println("Send Cancelled");
        }
      }
    } else {
      // End of blinking
      blinkingActive = false;
      unsigned long entryTime = millis(); // Unique key for Firebase
      String basePath = "/alert/data/" + String(entryTime); // Unique path

      if (!altMode) {
        digitalWrite(redLed, LOW);
        digitalWrite(greenLed, HIGH);
        Serial.println("Data sent to Firebase ✅");
        Serial.println("Firebase Path: " + basePath);

        if (app.ready()) {
          if (gps.location.isValid()) {
            Serial.println("GPS valid: Sending lat/lng");
            Database.set<double>(aClient, basePath + "/latitude", gps.location.lat(), processData, "RTDB_lat");
            Database.set<double>(aClient, basePath + "/longitude", gps.location.lng(), processData, "RTDB_lng");
          } else {
            Serial.println("GPS invalid: Sending default lat/lng");
            Database.set<double>(aClient, basePath + "/latitude", 41.40, processData, "RTDB_lat");
            Database.set<double>(aClient, basePath + "/longitude", 1.29, processData, "RTDB_lng");
          }

          Database.set<String>(aClient, basePath + "/username", "esp32_user", processData, "RTDB_user");
          Database.set<String>(aClient, basePath + "/audio", "help_audio_file.mp3", processData, "RTDB_audio");
        }
      } else {
        // Cancelled case
        digitalWrite(redLed, LOW);
        digitalWrite(greenLed, LOW);
        Serial.println("Final Status: Send Cancelled ❌");
      }
      altMode = false;
    }
  }
}
 
// ---------------- Firebase Result ----------------
void processData(AsyncResult &aResult) {
  if (!aResult.isResult()) return;

  if (aResult.isError())
    Firebase.printf("Error: %s, code: %d\n", aResult.error().message().c_str(), aResult.error().code());
  if (aResult.available())
    Firebase.printf("task: %s, payload: %s\n", aResult.uid().c_str(), aResult.c_str());
}
