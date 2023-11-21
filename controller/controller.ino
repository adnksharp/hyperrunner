#include <WiFi.h>
#include <ArduinoJson.h>
#include <Ticker.h>
#include <EEPROM.h>
#include <NewPing.h>
#include "time.h"
#include "pins.h"

float ref[2] = {0.1, 0}, out[2] = {0, 0}, err[2] = {0, 0},
      Kp[4] = {0, 0}, Ki[4] = {0, 0}, Kd[4] = {0, 0}, Rf[4] = {0, 0}, Yf[4] = {0, 0},
      obj[2] = {0, 0};

int changes[4];
byte mode = 0;

long long initTime = 0;
extern char cname[20];
const char domain[] = "http://10.42.0.1:3000";
char Release[] PROGMEM = __DATE__ " " __TIME__ " adnKsharp";

extern void URLS();
extern void SetWifi();
extern int myRssi();
extern String httpRequest(const char *domain, const char *path, bool post, String data);
extern void SendDevice(const char *domain);

extern void Sensors(float* u1, float* u2);
extern void Flash(int times);
extern void ConfigMotors();
extern void MotorWrite(int channel, int value);

void GetJson()
{
    String json = httpRequest(domain, "/status", false, "");
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, json);
    JsonObject obj = doc.as<JsonObject>();
    ref[0] = obj["rpm"]["reference"];
    ref[1] = obj["direction"]["reference"];
    if (strcmp(obj["mode"], "stop") == 0)
        mode = 0;
    else if (strcmp(obj["mode"], "run") == 0)
        mode = 1;
    else if (strcmp(obj["mode"], "pause") == 0)
        mode = 2;
}

void SendJson()
{
    int count = (obj[0] > 0 ? 1 : 0) + (obj[1] > 0 ? 1 : 0);
    String post = "{\"time\":" + String(float(millis() - initTime) / 1000.0F) + ",\"rpm\":{\"out\":" + String(out[0]) + ",\"reference\":" + String(ref[0]) + ",\"error\":" + String(err[0]) + ",\"percent\":[" + String(out[0]) + "," + String(err[0]) + "]},\"direction\":{\"out\":" + String(out[1]) + ",\"reference\":" + String(ref[1]) + ",\"error\":" + String(err[1]) + ",\"percent\":[" + String(out[1]) + "," + String(err[1]) + "]},\"objects\":{\"front\":" + String(obj[0]) + ",\"back\":" + String(obj[1]) + ",\"count\":" + String(count) + "},\"signal\":" + String(myRssi());
    if (mode == 0)
        post += ",\"mode\":\"stop\"}";
    else if (mode == 1)
        post += ",\"mode\":\"run\"}";
    else if (mode == 2)
        post += ",\"mode\":\"pause\"}";
    Serial.println("Enviando status");
    Serial.println(httpRequest(domain, "/update", true, post));
}

void EFL()
{
    digitalRead(ENCODER_FLA) == digitalRead(ENCODER_FLB) ? changes[0]++ : changes[0]--;
}

void EFR()
{
    digitalRead(ENCODER_FRA) == digitalRead(ENCODER_FRB) ? changes[1]++ : changes[1]--;
}

void EBL()
{
    digitalRead(ENCODER_BLA) == digitalRead(ENCODER_BLB) ? changes[2]++ : changes[2]--;
}

void EBR()
{
    digitalRead(ENCODER_BRA) == digitalRead(ENCODER_BRB) ? changes[3]++ : changes[3]--;
}

void setup()
{
    Serial.begin(115200);
    Serial.println("HRAP " + String(Release));
    Serial.println("Iniciando...");
    Serial.println(cname);

    pinMode(LED, OUTPUT);
    ConfigMotors();

    while (WiFi.status() != WL_CONNECTED)
    {
        SetWifi();
        delay(100);
    }
    SendDevice(domain);
}

void loop()
{
    
}