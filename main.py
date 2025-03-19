from flask import Flask, render_template, request, jsonify
import serial
import threading

app = Flask(__name__)

# Set up serial communication
ser = serial.Serial('/dev/ttyUSB1', 9600, timeout=1)

# Variables to track touch sensors
touch_detected = False   # First touch sensor
touch_detected2 = False  # Second touch sensor

# Function to continuously read from Arduino
def read_serial():
    global touch_detected, touch_detected2

    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8').strip()
            if line == "1":
                touch_detected = True
            elif line == "0":
                touch_detected = False
            elif line == "3":
                touch_detected2 = True

            elif line == "2":
                touch_detected2 = False

# Start background thread for serial reading
threading.Thread(target=read_serial, daemon=True).start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/status')
def status():
    return jsonify({
        "touch_detected": touch_detected,
        "touch_detected2": touch_detected2
    })

@app.route('/led', methods=['POST'])
def led_control():
    data = request.get_json()
    action = data.get('action')

    if action == "ON":
        ser.write(b"RED_ON\n")  
    elif action == "OFF":
        ser.write(b"RED_OFF\n")  
    elif action == "GON":
        ser.write(b"GREEN_ON\n")  
    elif action == "GOFF":
        ser.write(b"GREEN_OFF\n")  

    return jsonify({"status": "success"}), 200  # No page redirection

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
