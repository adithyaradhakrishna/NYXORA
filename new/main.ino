#define RED_LED 11  // Change pin if needed
#define GREEN_LED 10  // Change pin if needed
#define BLUE_LED 9  // Added a new LED for the third sensor

const int touchPin = 2;   // First touch sensor
const int touchPin2 = 3;  // Second touch sensor
const int touchPin3 = 4;  // Third touch sensor

int x = 0;
int y = 0;
int z = 0; // New variable for third touch sensor

void setup() {
    Serial.begin(9600);
    pinMode(RED_LED, OUTPUT);
    pinMode(GREEN_LED, OUTPUT);
    pinMode(BLUE_LED, OUTPUT);  // Set the third LED as output

    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(BLUE_LED, LOW);

    pinMode(touchPin, INPUT);
    pinMode(touchPin2, INPUT);
    pinMode(touchPin3, INPUT);
}

void loop() {
    int touchState = digitalRead(touchPin);
    int touchState2 = digitalRead(touchPin2);
    int touchState3 = digitalRead(touchPin3); // Read third sensor

    Serial.println(touchState);
    Serial.println(touchState2 + 2);
    Serial.println(touchState3 + 4);

    if (touchState != HIGH) {
        digitalWrite(RED_LED, LOW);
    }
    if (touchState2 != HIGH) {
        digitalWrite(GREEN_LED, LOW);
    }
    if (touchState3 != HIGH) {
        digitalWrite(BLUE_LED, LOW); // Ensure the third LED turns off
    }

    if (x == 1 && touchState == HIGH) {
        digitalWrite(RED_LED, HIGH);
    }
    if (y == 1 && touchState2 == HIGH) {
        digitalWrite(GREEN_LED, HIGH);
    }
    if (z == 1 && touchState3 == HIGH) {
        digitalWrite(BLUE_LED, HIGH); // Control third LED
    }

    if (Serial.available()) {
        String command = Serial.readStringUntil('\n');
        command.trim();
        Serial.println(command);
        Serial.println(touchState2);

        if (command == "RED_ON" && touchState == HIGH) {
            digitalWrite(RED_LED, HIGH);
            x = 1;
        } else if (command == "RED_OFF") {
            digitalWrite(RED_LED, LOW);
            x = 0;
        }
        if (command == "GREEN_ON" && touchState2 == HIGH) {
            digitalWrite(GREEN_LED, HIGH);
            y = 1;
        } else if (command == "GREEN_OFF") {
            digitalWrite(GREEN_LED, LOW);
            y = 0;
        }
        if (command == "BLUE_ON" && touchState3 == HIGH) { // New command for third sensor
            digitalWrite(BLUE_LED, HIGH);
            z = 1;
        } else if (command == "BLUE_OFF") {
            digitalWrite(BLUE_LED, LOW);
            z = 0;
        }
    }
    delay(100);
}
