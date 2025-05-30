from predictions import predictor
import pandas as pd

def test_predictor():
    # Show that model is already trained
    print("\n=== Model Training Status ===")
    print("Model is already trained on historical data (2008-2024)")
    print("Feature Importance for Championship Teams:")
    feature_importance = pd.DataFrame({
        'feature': predictor.features,
        'importance': predictor.model.feature_importances_
    })
    print(feature_importance.sort_values('importance', ascending=False))
    
    # Test 1: Get predictions for 2025
    print("\n=== Testing 2025 Champion Predictions ===")
    predictions = predictor.predict_2025_champion()
    
    # Test 2: Get probability for all teams in descending order, simple format
    print("\n=== Team Probabilities (Descending Order) ===")
    teams_2025 = predictor.data[predictor.data['YEAR'] == 2025]['TEAM'].unique()
    all_probs = []
    for team in teams_2025:
        prob = predictor.get_tournament_probability(team)
        if prob:
            all_probs.append(prob)
    # Sort by probability descending
    all_probs.sort(key=lambda x: x['probability'], reverse=True)
    for prob in all_probs:
        print(f"{prob['team']}: {prob['probability']}")

if __name__ == "__main__":
    test_predictor() 