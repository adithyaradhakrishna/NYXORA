// Define the pins
const int touchPin = 2;  // Pin where touch sensor is connected
const int ledPin = 13;   // Pin where red LED is connected

void setup() {
  // Initialize touch sensor pin as input
  pinMode(touchPin, INPUT);
  
  // Initialize LED pin as output
  pinMode(ledPin, OUTPUT);
  
  // Start serial communication (optional for debugging)
  Serial.begin(9600);
}

void loop() {
  // Read the state of the touch sensor
  int touchState = digitalRead(touchPin);
  
  if (touchState == HIGH) {  // If the sensor is touched
    digitalWrite(ledPin, HIGH);  // Turn on the red LED
    Serial.println("Touch detected! LED ON.");
  } else {
    digitalWrite(ledPin, LOW);   // Turn off the red LED
    Serial.println("No touch detected. LED OFF.");
  }

  delay(100);  // Small delay to prevent excessive serial printing
}
