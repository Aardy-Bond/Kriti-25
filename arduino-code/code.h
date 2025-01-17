#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "wifi_ssid";
const char* password = "wifi_password";


const char* mqtt_server = "server_name of hiveMQ";
const int mqtt_port = 88888 ; //port; 
const char* mqtt_user = "username on hiveMQ";
const char* mqtt_pass = "password on hiveMQ";


String strollerId = "stroller_001";
String topicData = "stroller/" + strollerId + "/data";
String topicCommands = "backend/" + strollerId + "/commands";


const char* ca_cert = \
"-----BEGIN CERTIFICATE-----\n" \
"intermediate certificate\n" \
"-----END CERTIFICATE-----\n" \
"-----BEGIN CERTIFICATE-----\n" \
"root certificate\n" \
"-----END CERTIFICATE-----\n";

WiFiClientSecure espClient;
PubSubClient client(espClient);


void setup_wifi();
void syncTime();
void reconnect();
void callback(char* topic, byte* message, unsigned int length);
void publishData();

void setup() {
  Serial.begin(115200);
  setup_wifi();
  syncTime();
  espClient.setCACert(ca_cert);
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  publishData();
  delay(86400);
}

void setup_wifi() {
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi");
}

void syncTime() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Waiting for NTP time sync: ");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2){
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("\nTime synchronized");
}

void reconnect(){
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection");
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    if(client.connect(clientId.c_str(), mqtt_user, mqtt_pass)){
      Serial.println("connected");
      client.subscribe(topicCommands.c_str());
    }else{
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);
}

void publishData() {
  StaticJsonDocument<256> doc;
  doc["carbonEmission"] = 100;
  doc["company"] = "ABC Limited";

  char jsonBuffer[512];
  size_t n = serializeJson(doc, jsonBuffer);
  client.publish(topicData.c_str(), jsonBuffer, n);
  Serial.println("Published data");
}