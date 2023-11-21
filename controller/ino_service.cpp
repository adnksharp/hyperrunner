#include <Arduino.h>
#include <NewPing.h>
#include "pins.h"

NewPing FrntSensor(TRIGGER_F, ECHO_F, 150);
NewPing BackSensor(TRIGGER_B, ECHO_B, 150);

void ConfigMotors()
{
    ledcSetup(CHANNEL1A, FREQ, RES);
    ledcAttachPin(MOTOR_FLA, CHANNEL1A);
    ledcSetup(CHANNEL1B, FREQ, RES);
    ledcAttachPin(MOTOR_FLB, CHANNEL1B);
    ledcSetup(CHANNEL2A, FREQ, RES);
    ledcAttachPin(MOTOR_FRA, CHANNEL2A);
    ledcSetup(CHANNEL2B, FREQ, RES);
    ledcAttachPin(MOTOR_FRB, CHANNEL2B);
    ledcSetup(CHANNEL3A, FREQ, RES);
    ledcAttachPin(MOTOR_BLA, CHANNEL3A);
    ledcSetup(CHANNEL3B, FREQ, RES);
    ledcAttachPin(MOTOR_BLB, CHANNEL3B);
    ledcSetup(CHANNEL4A, FREQ, RES);
    ledcAttachPin(MOTOR_BRA, CHANNEL4A);
    ledcSetup(CHANNEL4B, FREQ, RES);
    ledcAttachPin(MOTOR_BRB, CHANNEL4B);
}

void Sensors(float *u1, float *u2)
{
    //u1 = float(FrntSensor.ping_cm());
    //u2 = float(BackSensor.ping_cm());
}

void Flash(int times)
{
    digitalWrite(LED, HIGH);
    delay(times);
    digitalWrite(LED, LOW);
}

void MotorWrite(int channel, int value)
{
    ledcWrite(channel, value);
}