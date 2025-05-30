from flask import Blueprint, jsonify, request
from ..predictions import predictor

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('/api/predictions', methods=['GET'])
def get_all_predictions():
    """Get predictions for all teams in the tournament"""
    predictions = predictor.predict_2025_champion()
    
    # Get top 9 teams
    top_9 = predictions[:9]
    
    # Calculate field percentage (sum of remaining teams)
    field_percentage = sum(pred['probability'] for pred in predictions[9:])
    
    # Format the response to match the frontend's expected structure
    formatted_predictions = []
    
    # Add top 9 teams
    for pred in top_9:
        formatted_predictions.append({
            'teamName': pred['team'],
            'winPercentage': pred['probability']
        })
    
    # Add field as the 10th entry
    formatted_predictions.append({
        'teamName': 'Field',
        'winPercentage': round(field_percentage, 2)
    })
    
    return jsonify(formatted_predictions) 