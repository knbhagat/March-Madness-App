# mypy: disable-error-code="import-not-found"
from flask import Blueprint, request, jsonify, session
from app import db
from app.models.user import User
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app as app

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


# Route for user registration
@auth_bp.route('/register', methods=['POST'])
def register():

    data = request.get_json()

    # Handle existing email edge case
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"error": "Email already exists"}), 400

    # hash passwork before creating new user
    hashed_password = generate_password_hash(data['password'])

    # new user now with hashed password
    new_user = User(
        email=data['email'], password=hashed_password, balance=data.get('balance', 0)
    )

    # Add new user to database
    db.session.add(new_user)
    db.session.commit()

    # Stores user ID
    session['id'] = new_user.id
    return (
        jsonify({"message": "User registered", "user": data, 'token': new_user.id}),
        201,
    )


# Route for user login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()  # Find user email in database

    if not user or not check_password_hash(
        user.password, password
    ):  # Direct password comparison (now hashed)
        return jsonify({'error': 'Invalid email or password.'}), 401

    # Store user ID in session for auth
    session['id'] = user.id
    return jsonify({'message': 'Login successful', 'token': user.id}), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)  # Remove user session

    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route('/get-user', methods=['GET'])
def get_user():
    auth = request.headers.get("Authorization")

    if not auth or not auth.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token"}), 401

    try:
        user_id = int(auth.split()[1])
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "email": user.email,
            "hashed_password": user.password
        }), 200

    except Exception as e:
        print("🔥 Error in /get-user:", e)  # Logs to Flask console
        return jsonify({"message": "Internal Server Error"}), 500

@auth_bp.route('/update-profile', methods=['POST'])
def update_profile():
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token"}), 401

    user_id = auth.split()[1]
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.form or request.get_json()

    new_email = data.get("email")
    new_password = data.get("password")

    if new_email and new_email != user.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({"error": "Email already in use"}), 400
        user.email = new_email

    if new_password:
        user.password = generate_password_hash(new_password)

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200

## Dummy routes (for now), possibly delete: 
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


@auth_bp.route('/delete-account', methods=['DELETE'])
def delete_account():
    return jsonify({"message": "Account deleted"}), 200
