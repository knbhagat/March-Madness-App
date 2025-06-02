from predictions import MarchMadnessPredictor
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score, classification_report
import numpy as np
import pandas as pd

def evaluate_model():
    # Initialize the predictor
    predictor = MarchMadnessPredictor()
    
    # Get the training data
    historical_data = predictor.data[predictor.data['YEAR'] < 2025]
    X = historical_data[predictor.features].values
    y = historical_data['Champion'].map({'Yes': 1, 'No': 0}).values
    
    # Scale the features
    X_scaled = predictor.scaler.transform(X)
    
    # Perform 5-fold cross-validation
    cv_scores = cross_val_score(predictor.model, X_scaled, y, cv=5)
    
    # Print cross-validation results
    print("\nCross-Validation Results:")
    print(f"Mean Accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
    
    # Get predictions on training data
    y_pred = predictor.model.predict(X_scaled)
    
    # Print detailed classification report
    print("\nDetailed Classification Report:")
    print(classification_report(y, y_pred, target_names=['Not Champion', 'Champion']))
    
    # Print feature importance
    feature_importance = pd.DataFrame({
        'feature': predictor.features,
        'importance': predictor.model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    print(feature_importance)

if __name__ == "__main__":
    evaluate_model() 