#include <WiFi.h>
#include <ArduinoJson.h>
#include <Ticker.h>
#include <PID_v1.h>
#include "time.h"
#include "pins.h"

Ticker ticker;

float ref[2] = {1, 1}, err[2] = {0, 0}, out[2] = {0, 0}, percent[2] = {0, 0};

byte Rf[8] = {0, 0}, Yf[8] = {0, 0}, yt[2] = {0, 0};
long count[4] = {0, 0, 0, 0}, 
     ef[2] = {0, 0}, efl[2] = {0, 0},
     timers[2] = {0, 0}, ltimers[2] = {0, 0};
bool history[4] = {false, false, false, false};

byte mode = 0;

double Setpoint[2] = {100.0, 100.0};
double Input[2], Output[2];
double Kp[2] = {2.0, 2.0};
double Ki[2] = {5.0, 5.0};
double Kd[2] = {1.0, 1.0};
PID mavel(&Input[0], &Output[0], &Setpoint[0], Kp[0], Ki[0], Kd[0], DIRECT);
PID mango(&Input[1], &Output[1], &Setpoint[1], Kp[1], Ki[1], Kd[1], DIRECT);

long long initTime = 0, sendTime = 0;
extern char cname[20];
const char domain[] = "http://10.42.0.1:3000";
char Release[] PROGMEM = __DATE__ " " __TIME__ " adnKsharp";

extern void URLS();
extern void SetWifi();
extern int myRssi();
extern String httpRequest(const char *domain, const char *path, bool post, String data);
extern void SendDevice(const char *domain);

extern void Flash(int times);
extern void PinMode();

void GetJson()
{
    int aux = mode;
    String json = httpRequest(domain, "/status", false, "");
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, json);
    JsonObject obj = doc.as<JsonObject>();
    // json: {"time":0,"rpm":{"out":0,"reference":[-87]
    // print rpm
    ref[0] = obj["rpm"]["reference"][0];
    ref[1] = obj["direction"]["reference"][0];

    try
    {
        String modered = obj["mode"];
        if (modered == "stop")
            mode = 0;
        else if (modered == "run")
            mode = 1;
        else if (modered == "pause")
            mode = 2;
    }
    catch (const std::exception &e)
    {
    }
    Setpoint[0] = ref[0];
    Setpoint[1] = ref[1];
}

void SendJson()
{
    //out[0] = count[2];
    if (ref[0] == 0)
    {
        err[0] = 0;
        percent[0] = 1;
        percent[1] = 0;
    }
    else
    {
        err[0] = abs(ref[0] - out[0]);
        percent[0] = float(out[0]) / float(ref[0]);
        percent[1] = float(err[0]) / float(ref[0]);
    }
    //out[1] = count[0];
    if (ref[1] == 0)
    {
        err[1] = 0;
        percent[0] = 1;
        percent[1] = 0;
    }
    else
    {
        err[1] = abs(ref[1] - out[1]);
        percent[0] = float(out[1]) / float(ref[1]);
        percent[1] = float(err[1]) / float(ref[1]);
    }

    String post = "{\"time\":[" + String(float(millis() - initTime) / 1000.0F) +
                  "],\"rpm\":{\"out\":[" + String(out[0]) +
                  "],\"reference\":[" + String(ref[0]) +
                  "],\"error\":[" + String(err[0]) +
                  "],\"percent\":[" + String(percent[0]) + "," + String(percent[0]) +
                  "]},\"direction\":{\"out\":[" + String(out[1]) +
                  "],\"reference\":[" + String(ref[1]) +
                  "],\"error\":[" + String(err[1]) +
                  "],\"percent\":[" + String(percent[1]) + "," + String(percent[1]) +
                  "]},\"objects\":{\"front\":[ 0" +
                  "],\"back\":[ 0" +
                  "],\"count\":[ 0" +
                  "]},\"signal\":" + String(myRssi());
    if (mode == 0)
        post += ",\"mode\":\"stop\"}";
    else if (mode == 1)
        post += ",\"mode\":\"run\"}";
    else if (mode == 2)
        post += ",\"mode\":\"pause\"}";
    Serial.println(httpRequest(domain, "/update", true, post));
}

void FrontLeftCounter()
{
    if (digitalRead(encoder_flm) == digitalRead(encoder_flc))
        count[0]++;
    else
        count[0]--;
}

void FrontRightCounter()
{
    if (digitalRead(encoder_frm) == digitalRead(encoder_frc))
        count[1]++;
    else
        count[1]--;
}

void BackCounter()
{
    if (digitalRead(encoder_brm) == digitalRead(encoder_brc))
        count[2]++;
    else
        count[2]--;
}

void setup()
{
    PinMode();
    Serial.begin(115200);

    while (WiFi.status() != WL_CONNECTED)
    {
        SetWifi();
        delay(100);
    }
    ticker.attach_ms(200, GetJson);
    SendDevice(domain);
    attachInterrupt(digitalPinToInterrupt(encoder_flm), FrontLeftCounter, RISING);
    attachInterrupt(digitalPinToInterrupt(encoder_frm), FrontRightCounter, RISING);
    attachInterrupt(digitalPinToInterrupt(encoder_brm), BackCounter, RISING);
    initTime = millis();
    mavel.SetMode(AUTOMATIC);
    mango.SetMode(AUTOMATIC);
}

void loop()
{
    // print counter value
    if (WiFi.status() != WL_CONNECTED)
    {
        ticker.detach();
        SetWifi();
        delay(100);
        ticker.attach_ms(200, GetJson);
    }
    if (abs(count[0] - count[1]) > 30)
    {
        if (abs(count[0]) < abs(count[1]))
        {
            count[1] = count[0];
        }
        else if (abs(count[0]) > abs(count[1]))
        {
            count[0] = count[1];
        }
        else
        {
            count[0] = 0;
            count[1] = 0;
        }
    }

    if (mode == 1)
    {
        if (millis() - sendTime > 200 && mode != 2)
        {
            SendJson();
            sendTime = millis();
        }
        Input[0] = calcularVelocidad();
        mavel.Compute();
        controlarMotor(Output[0]);
    }
    else
    {
        for (byte i = 0; i < 8; i++)
            ledcWrite(i, 0);
    }
}

int calcularVelocidad()
{
    int ticksPorVuelta = 486;
    double tiempoEntreInterrupciones = 0.01; // en segundos
    double velocidad = (count[2] / ticksPorVuelta) / tiempoEntreInterrupciones * 60.0;
    out[0] = velocidad;
    count[2] = 0;

    return velocidad;
}

void controlarMotor(double output)
{
    int velocidadMotor = constrain(output, -255, 255);

    if (velocidadMotor > 0)
    {
        digitalWrite(MOTOR_BLR, HIGH);
        digitalWrite(MOTOR_BRR, HIGH);
        digitalWrite(MOTOR_BLD, LOW);
        digitalWrite(MOTOR_BRD, LOW);
        ledcWrite(4, abs(velocidadMotor));
        ledcWrite(6, abs(velocidadMotor));
        Serial.println("uclock");
    }
    else
    {
        Serial.println("Clock");
        digitalWrite(MOTOR_BLR, LOW);
        digitalWrite(MOTOR_BRR, LOW);
        digitalWrite(MOTOR_BLD, HIGH);
        digitalWrite(MOTOR_BRD, HIGH);
        ledcWrite(5, abs(velocidadMotor));
        ledcWrite(7, abs(velocidadMotor));
    }
}
