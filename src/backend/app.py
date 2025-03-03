from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import jwt
import datetime
import os
from flask_sqlalchemy import SQLAlchemy

# Must have flask cors: pip install flask flask-cors pyjwt
# jwt: pip install PyJWT

app = Flask(__name__)
CORS(app)

#Configures uri for MySQL database and creates a database object

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "your_secret_key")  # Load from env
<<<<<<< HEAD
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://username:password@localhost/march_maddness_betting'
=======
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://username:password@localhost/march_madness_betting'
>>>>>>> 1ccd61243fb51f85477589b368c39913e4e67f48

db = SQLAlchemy(app)

#Each user, bet, and game will be stored in the database with the following parameters
class Bet(db.Model):
    bet_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer)
    game_id = db.Column(db.Integer)
    bet_amount = db.Column(db.Integer)
    bet_type = db.Column(db.String(20))
    odds = db.Column(db.Double)
    status = db.Column(db.String(20))
    created_at = db.Column(db.String(20))

class Game(db.Model):
    game_id = db.Column(db.Integer, primary_key = True)
    team_1 = db.Column(db.String(20))
    team_2 = db.Column(db.String(20))
    start_time = db.Column(db.String(20))
    winner = db.Column(db.String(20))

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(20), unique_key = True)
    password = db.Column(db.String(20))
    balance = db.Column(db.Integer)

# Error Handling
@app.errorhandler(500)
def internal_error(error):
    return jsonify({"message": "Internal Server Error"}), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"message": "Not Found Error"}), 404

# Triggering a 500 Internal Server Error intentionally
@app.route('/some-500-error-route')
def some_500_error_route():
    abort(500)

# Route Configuration
@app.route('/')
def hello_world():
    return jsonify({"message": "Hello, World!"})

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    new_user = User(user_id = data['id'], email = data['email'], password = data['password'], balance = data['balance'])
    db.session.add(new_user)
    db.session.commit()
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
    app.run(debug=True, host='0.0.0.0', port=8000)
