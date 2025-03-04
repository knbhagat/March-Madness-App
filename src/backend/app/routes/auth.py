from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
import jwt
import datetime
from flask import current_app as app

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():

    data = request.get_json()
    new_user = User(email=data['email'], password=data['password'], balance=data.get('balance', 0))
    
    ##TODO check if user is already in DB before trying to write
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered", "user": data}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get("email")).first()

    if user and user.password == data.get("password"):  # Replace with hashed password check
        token = jwt.encode(
            {"user": user.email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )
        return jsonify({"message": "Login successful", "token": token})

    return jsonify({"message": "Invalid credentials"}), 401


## Dummy routes (for now) : 
@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    return jsonify({"message": "Password reset link sent"}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    return jsonify({"message": "Password reset successful"}), 200

@auth_bp.route('/verify-email', methods=['GET'])
def verify_email():
    return jsonify({"message": "Email verified"}), 200

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    return jsonify({"message": "Verification email resent"}), 200

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    return jsonify({"message": "Password changed successfully"}), 200

@auth_bp.route('/update-profile', methods=['POST'])  
def update_profile():
    return jsonify({"message": "Profile updated"}), 200

@auth_bp.route('/delete-account', methods=['DELETE'])
def delete_account():
    return jsonify({"message": "Account deleted"}), 200
