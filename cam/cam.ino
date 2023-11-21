#include <esp_camera.h>
#include <esp_int_wdt.h>
#include <esp_task_wdt.h>
// #include <DNSServer.h>
// #include <WiFiUdp.h>
// #include <ArduinoOTA.h>
// #include "src/parsebytes.h"
// #include "time.h"
// #include <ESPmDNS.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include <Ticker.h>
#include <EEPROM.h>
#include <NewPing.h>
#include "time.h"

#include "pins.h"
camera_config_t config;

extern char cname[20];
const char domain[] = "http://10.42.0.1:3000";
char Release[] PROGMEM = __DATE__ " " __TIME__ " adnKsharp";

int streamPort = 81;
int myRotation = 0;
int minFrameTime = 0;
int lampVal = 0;
int lampChannel = 7;
const int pwmfreq = 50000;
const int pwmresolution = 9;
const int pwmMax = pow(2, pwmresolution) - 1;
bool filesystem = false;
bool otaEnabled = false;
unsigned long xclk = 8;

extern void URLS();
extern void SetWifi();
extern int myRssi();
extern String httpRequest(const char *domain, const char *path, bool post, String data);
extern void SendDevice(const char *domain);

void setLamp(int newVal)
{
    if (newVal != -1)
    {
        int brightness = round((pow(2, (1 + (newVal * 0.02))) - 2) / 6 * pwmMax);
        ledcWrite(lampChannel, brightness);
        Serial.print("Lamp: ");
        Serial.print(newVal);
        Serial.print("%, pwm = ");
        Serial.println(brightness);
    }
}

void Flash(int times)
{
    digitalWrite(LED, HIGH);
    delay(times);
    digitalWrite(LED, LOW);
}

void StartCamera()
{
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = xclk * 1000000;
    config.pixel_format = PIXFORMAT_JPEG;
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;

    esp_err_t err = esp_camera_init(&config);
    Serial.println("Iniciando camara...");
    if (err != ESP_OK)
    {
        delay(100);
        Serial.println("Error!!!");
        periph_module_disable(PERIPH_I2C0_MODULE);
        periph_module_disable(PERIPH_I2C1_MODULE);
        periph_module_reset(PERIPH_I2C0_MODULE);
        periph_module_reset(PERIPH_I2C1_MODULE);
        esp_task_wdt_init(60, true);
        esp_task_wdt_add(NULL);
    }
    else
    {
        Serial.println("Ok");
        sensor_t *s = esp_camera_sensor_get();
        int sensorPID = s->id.PID;

        if (sensorPID == OV3660_PID)
        {
            s->set_vflip(s, 1);
            s->set_brightness(s, 1);
            s->set_saturation(s, -2);
        }
    }
}

void GetJson()
{
    String json = httpRequest(domain, "/status", false, "");
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, json);
    JsonObject obj = doc.as<JsonObject>();
    /*
    ref[0] = obj["rpm"]["reference"];
    ref[1] = obj["direction"]["reference"];
    if (strcmp(obj["mode"], "stop") == 0)
        mode = 0;
    else if (strcmp(obj["mode"], "run") == 0)
        mode = 1;
    else if (strcmp(obj["mode"], "pause") == 0)
        mode = 2;
    */
}

void SendJson()
{
    String post = "{\"time\":0}";
    Serial.println("Enviando status");
    Serial.println(httpRequest(domain, "/update", true, post));
}

void setup()
{
    Serial.begin(115200);
    Serial.setDebugOutput(true);
    Serial.println("HRAP " + String(Release));
    Serial.println("Iniciando...");
    Serial.println(cname);

    pinMode(LED, OUTPUT);
    if (!psramFound())
    {
        Serial.println("\r\nError fatal...");
        while (true)
        {
            Serial.println("PSRAM no encontrda");
            Flash(2500);
            delay(2500);
        }
    }

    StartCamera();

    while (WiFi.status() != WL_CONNECTED)
    {
        SetWifi();
        delay(100);
    }
    ledcSetup(lampChannel, pwmfreq, pwmresolution);
    ledcAttachPin(LAMP_PIN, lampChannel);
    setLamp(lampVal);

    SendDevice(domain);
}

void loop()
{
}