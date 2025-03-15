from flask import Blueprint, request, jsonify, session
from app import db
from app.models.bracket import Bracket
from app.models.user import User
import datetime
from flask import current_app as app

auth_bp = Blueprint('bracket', __name__)

api_key = 'jDrDUvhEht7LF0QsD6fV22sGyLbijW9HrzvHO4C4' # Bad code practice, make sure I hide it later
mm_tournament_id = '56befd3f-4024-47c4-900f-892883cc1b6b'

# Returns live bracket from API
@auth_bp.route('/get_bracket', methods=['GET'])
def get_realtime_bracket():
    url = url = f"https://api.sportradar.com/ncaamb/trial/v8/en/tournaments/{mm_tournament_id}/schedule.json?api_key={api_key}"
    headers = {"accept": "application/json"}
    response = request.get(url, headers=headers)
    return response

# Returns users bracket that has already been created
@auth_bp.route('/get_user_bracket/<int:bracket_number>', methods=['GET'])
def get_user_bracket(bracket_number):
    # User Verification
    user, mes, errNum = verify_user()
    if (user == None):
        return mes, errNum

    # Fetch the user's bracket by user_id and bracket_number
    bracket = Bracket.query.filter_by(id=user.id, bracket_number=bracket_number).first()
    if not bracket:
        return jsonify({'error': 'Bracket not found'}), 404
    
    # Return the bracket selection data
    return jsonify({
        'message': 'Bracket retrieved successfully',
        'bracket': bracket.bracket_selection
    }), 200

# Created User Bracket
@auth_bp.route('/create_user_bracket', methods=['POST'])
def create_user_bracket():
    # User Verification
    user, mes, errNum = verify_user()
    if (user == None):
        return mes, errNum
    # Get bracket number  and bracket selection
    data = request.get_json()
    bracket_number = data.get('bracket_number')
    bracket_selection = data.get('bracket_selection')
    if not bracket_number or not bracket_selection:
        return jsonify({'error': 'Bracket number and bracket selection are required'}), 400
    # Check if the user already has a bracket for the given bracket_number
    existing_bracket = Bracket.query.filter_by(id=user.id, bracket_number=bracket_number).first()
    if existing_bracket:
        # If the bracket exists, we can either update
        existing_bracket.bracket_selection = bracket_selection
        db.session.commit()
        return jsonify({'message': 'Bracket updated successfully', 'bracket': bracket_selection}), 200

    # If the bracket doesn't exist, create a new one
    new_bracket = Bracket(
        id=user.id,
        bracket_number=bracket_number,
        bracket_selection=bracket_selection
    )
    db.session.add(new_bracket)
    db.session.commit()
    return jsonify({'message': 'Bracket created successfully', 'bracket': bracket_selection}), 201

# User Verification
def verify_user():
    user_id = session.get('id')
    if not user_id:
        return None, jsonify({'error': 'User not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return None, jsonify({'error': 'User not found'}), 404
    
    return user, None, None


