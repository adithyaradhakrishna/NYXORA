#define RED_LED 11  // Change pin if needed
#define GREEN_LED 10  // Change pin if needed

const int touchPin = 2;  // Pin where touch sensor is connected
const int touchPin2 = 3;  // Pin where touch sensor is connected

int x=0;
int y=0;

void setup() {
    Serial.begin(9600);
    pinMode(RED_LED, OUTPUT);
    pinMode(GREEN_LED, OUTPUT);

    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, LOW);

  pinMode(touchPin, INPUT);
  pinMode(touchPin2, INPUT);

}

void loop() {
  int touchState = digitalRead(touchPin);
  int touchState2 = digitalRead(touchPin2);

  Serial.println(touchState);
  Serial.println(touchState2 + 2);

        if(touchState != HIGH){
            digitalWrite(RED_LED, LOW);

        }
                if(touchState2 != HIGH){
            digitalWrite(GREEN_LED, LOW);

        }
        if(x==1 && touchState == HIGH){
            digitalWrite(RED_LED, HIGH);

        }
                if(y==1 && touchState2 == HIGH){
            digitalWrite(GREEN_LED, HIGH);

        }
    if (Serial.available()) {
        String command = Serial.readStringUntil('\n');
        command.trim();
            Serial.println(command);
            Serial.println(touchState2);

        

        if (command == "RED_ON" && touchState == HIGH) {
            digitalWrite(RED_LED, HIGH);
            x=1;
        } else if (command == "RED_OFF") {
            digitalWrite(RED_LED, LOW);
            x=0;
        }
                if (command == "GREEN_ON" && touchState2 == HIGH) {
            digitalWrite(GREEN_LED, HIGH);
            y=1;
        } else if (command == "GREEN_OFF") {
            digitalWrite(GREEN_LED, LOW);
            y=0;
        }

    }
    delay(100);
}
