#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
struct station
{
    const char ssid[65];
    const char pass[65];
    const bool dhcp;
};
#include "config.h"

IPAddress ip;
IPAddress gateway;
IPAddress gw;

char cname[20] = HR_NAME;
int httpPort = 80, stationCount = sizeof(Station) / sizeof(Station[0]), firstRun = 0;

extern void Flash(int times);

void ParseBytes(const char *str, char sep, byte *bytes, int maxBytes, int base)
{
    for (int i = 0; i < maxBytes; i++)
    {
        bytes[i] = strtoul(str, NULL, base);
        str = strchr(str, sep);
        if (str == NULL || *str == '\0')
        {
            break;
        }
        str++;
    }
}

void URLS()
{
    if (httpPort != 80)
        Serial.println("http://" + String(ip[0]) + "." + String(ip[1]) + "." + String(ip[2]) + "." + String(ip[3]) + ":" + String(httpPort));
    else
        Serial.println("http://" + String(ip[0]) + "." + String(ip[1]) + "." + String(ip[2]) + "." + String(ip[3]));
}

int myRssi()
{
    int rssi = WiFi.RSSI();
    if (rssi < -100)
        return 0;
    else if (rssi > -50)
        return 100;
    else
        return 2 * (rssi + 100);
}

void SetWifi()
{
    Flash(100);
    delay(100);
    Flash(100);
    Serial.println("Configurando WiFi...");
    WiFi.setSleep(false);
    Serial.println("SSIDs configurados:");
    if (stationCount > firstRun)
    {
        for (int i = firstRun; i < stationCount; i++)
        {
            Serial.println(Station[i].ssid);
        }
    }
    else
        Serial.println("\tNinguno");

    byte mac[6] = {0};
    WiFi.macAddress(mac);
    Serial.println("MAC: " + String(mac[0], HEX) + ":" + String(mac[1], HEX) + ":" + String(mac[2], HEX) + ":" + String(mac[3], HEX) + ":" + String(mac[4], HEX) + ":" + String(mac[5], HEX));

    int bestStation = -1;
    long bestRSSI = -1024;
    char bestSSID[65] = "";
    uint8_t bestBSSID[6];
    if (stationCount > firstRun)
    {
        Serial.println("\nBuscando redes...");
        int j = WiFi.scanNetworks();
        Serial.println(String(j) + "\tredes encontradas");
        if (j > 0)
        {
            for (int i = 0; i < j; ++i)
            {
                String thisSSID = WiFi.SSID(i);
                int thisRSSI = WiFi.RSSI(i);
                String thisBSSID = WiFi.BSSIDstr(i);
                Serial.println(String(i + 1) + " : [" + thisBSSID + "] " + thisSSID + " (" + String(thisRSSI) + ")");
                for (int k = firstRun; k < stationCount; k++)
                {
                    if ((strcmp(Station[k].ssid, thisSSID.c_str()) == 0) ||
                        (strcmp(Station[k].ssid, thisBSSID.c_str()) == 0))
                    {
                        Serial.println("! Red conocida");
                        if (thisRSSI > bestRSSI)
                        {
                            bestStation = k;
                            strncpy(bestSSID, thisSSID.c_str(), 64);
                            ParseBytes(thisBSSID.c_str(), ':', bestBSSID, 6, 16);
                            bestRSSI = thisRSSI;
                        }
                    }
                }
                Serial.println();
            }
        }
    }

    if (bestStation == -1)
        Serial.println("No se encontró ninguna red conocida");
    else
    {
        Serial.println("Conectando a " + String(bestSSID) + ": [" + String(bestBSSID[0], HEX) + ":" + String(bestBSSID[1], HEX) + ":" + String(bestBSSID[2], HEX) + ":" + String(bestBSSID[3], HEX) + ":" + String(bestBSSID[4], HEX) + ":" + String(bestBSSID[5], HEX) + "]...");
        WiFi.setHostname(cname);
        WiFi.begin(bestSSID, Station[bestStation].pass);
        unsigned long start = millis();
        while (WiFi.status() != WL_CONNECTED)
        {
            Flash(100);
            delay(100);
            if (millis() - start > WIFI_WATCHDOG)
            {
                Serial.println("No se pudo conectar a la red " + String(bestSSID));
                break;
            }
        }
        if (WiFi.status() == WL_CONNECTED)
        {
            Serial.println("Conexión establecida");
            Serial.println("\nIP: " + WiFi.localIP().toString());
            Serial.println("MAC: " + WiFi.macAddress());
            Serial.println("Gateway: " + WiFi.gatewayIP().toString());
            Serial.println("DNS: " + WiFi.dnsIP().toString());
            Serial.println("Subnet: " + WiFi.subnetMask().toString());
            ip = WiFi.localIP();
            gateway = WiFi.gatewayIP();
            gw = WiFi.subnetMask();
            if (Station[bestStation].dhcp)
            {
                Serial.println("DHCP: Activado");
            }
            else
            {
                Serial.println("DHCP: Desactivado");
                WiFi.config(ip, gateway, gw);
            }
            URLS();
        }
    }
}

String httpRequest(const char *domain, const char *path, bool post, String data)
{
    String payload = "";
    int httpCode = 0;
    if (WiFi.status() == WL_CONNECTED)
    {
        WiFiClient client;
        HTTPClient http;
        http.begin(client, domain + String(path));
        if (post)
        {
            http.addHeader("Content-Type", "application/json");
            httpCode = http.POST(data);
        }
        else
        {
            httpCode = http.GET();
        }
        
        if (httpCode > 0)
        {
            if (httpCode == HTTP_CODE_OK)
            {
                payload = http.getString();
            }
            else
            {
                payload = "Error: " + String(httpCode);
            }
        }
        else
        {
            payload = "Error: " + String(http.errorToString(httpCode).c_str());
        }
        http.end();
    }
    else
    {
        payload = "Error: No hay conexión a internet";
    }
    return payload;
}

void SendDevice(const char *domain)
{
    String post = "{\"name\":\"" + String(cname) + "\",\"mac\":\"" + WiFi.macAddress() + "\",\"ip\":\"" + WiFi.localIP().toString() + "\",\"gateway\":\"" + WiFi.gatewayIP().toString() + "\",\"dns\":\"" + WiFi.dnsIP().toString() + "\",\"subnet\":\"" + WiFi.subnetMask().toString() + "\",\"signal\":" + String(myRssi()) + "}";
    Serial.println("Enviando datos del dispositivo...");
    Serial.println(httpRequest(domain, "/device", true, post));
}