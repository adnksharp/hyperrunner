#include <Arduino.h>
//#include <NewPing.h>
#include "pins.h"

//NewPing FrntSensor(TRIGGER_F, ECHO_F, 150);
//NewPing BackSensor(TRIGGER_B, ECHO_B, 150);

extern void FrontLeftCounter();
extern void FrontRightCounter();
extern void BackCounter();

void PinMode()
{
    ledcSetup(reversefl, FREQ, RES);
    ledcAttachPin(MOTOR_FLR, reversefl);
    ledcSetup(drivefl, FREQ, RES);
    ledcAttachPin(MOTOR_FLD, drivefl);
    ledcSetup(reversefr, FREQ, RES);
    ledcAttachPin(MOTOR_FRR, reversefr);
    ledcSetup(drivefr, FREQ, RES);
    ledcAttachPin(MOTOR_FRD, drivefr);
    ledcSetup(reversebl, FREQ, RES);
    ledcAttachPin(MOTOR_BLR, reversebl);
    ledcSetup(drivebl, FREQ, RES);
    ledcAttachPin(MOTOR_BLD, drivebl);
    ledcSetup(reversebr, FREQ, RES);
    ledcAttachPin(MOTOR_BRR, reversebr);
    ledcSetup(drivebr, FREQ, RES);
    ledcAttachPin(MOTOR_BRD, drivebr);

    pinMode(LED, OUTPUT);

    pinMode(encoder_flm, INPUT);
    pinMode(encoder_flc, INPUT);
    pinMode(encoder_frm, INPUT);
    pinMode(encoder_frc, INPUT);
    pinMode(encoder_blm, INPUT);
    pinMode(encoder_blc, INPUT);
    pinMode(encoder_brm, INPUT);
    pinMode(encoder_brc, INPUT);
}

void Flash(int times)
{
    digitalWrite(LED, HIGH);
    delay(times);
    digitalWrite(LED, LOW);
}