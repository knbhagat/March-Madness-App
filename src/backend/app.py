from flask import Flask, jsonify, request
from flask_cors import CORS
import jwt
import datetime
import os

# Must have flask cors: pip install flask flask-cors pyjwt
# jwt: pip install PyJWT

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "your_secret_key")  # Load from env

@app.route('/')
def hello_world():
    return jsonify({"message": "Hello, World!"})

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    return jsonify({"message": "User registered", "user": data}), 201   # HTTP status code 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    # Dummy authentication (Replace with DB check)
    if data.get("username") == "test" and data.get("password") == "password":
        token = jwt.encode({"user": data["username"], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({"message": "Login successful", "token": token})
    return jsonify({"message": "Invalid credentials"}), 401 # HTTP status code 401

@app.route('/auth/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Logout successful"}), 200   # HTTP status code 200

@app.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    return jsonify({"message": "Password reset link sent"}), 200

@app.route('/auth/reset-password', methods=['POST'])
def reset_password():
    return jsonify({"message": "Password reset successful"}), 200

@app.route('/auth/verify-email', methods=['GET'])
def verify_email():
    return jsonify({"message": "Email verified"}), 200

@app.route('/auth/resend-verification', methods=['POST'])
def resend_verification():
    return jsonify({"message": "Verification email resent"}), 200

@app.route('/auth/change-password', methods=['POST'])
def change_password():
    return jsonify({"message": "Password changed successfully"}), 200

@app.route('/auth/update-profile', methods=['POST'])  
def update_profile():
    return jsonify({"message": "Profile updated"}), 200

@app.route('/auth/delete-account', methods=['DELETE'])
def delete_account():
    return jsonify({"message": "Account deleted"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
