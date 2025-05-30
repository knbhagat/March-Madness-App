import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import os

class MarchMadnessPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.data = None
        self.load_data()
        self.train_model()
        
    def load_data(self):
        """Load and preprocess the team statistics data"""
        # Load data
        data_path = os.path.join(os.path.dirname(__file__), 'data', 'March_madness_data.csv')
        self.data = pd.read_csv(data_path)
        
        # Convert R SCORE to float, replacing any non-numeric values with 0
        self.data['R SCORE'] = pd.to_numeric(self.data['R SCORE'], errors='coerce').fillna(0)
        
        # Create features for prediction
        self.features = ['NET RPI', 'RESUME', 'B POWER', 'R SCORE']
        
    def train_model(self):
        """Train the model on historical champion data"""
        # Prepare training data using historical data (2008-2024)
        historical_data = self.data[self.data['YEAR'] < 2025]
        X = historical_data[self.features].values
        y = historical_data['Champion'].map({'Yes': 1, 'No': 0}).values
        
        # Scale the features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train the model
        self.model.fit(X_scaled, y)

        feature_importance = pd.DataFrame({
            'feature': self.features,
            'importance': self.model.feature_importances_
        })
        
    def get_team_stats(self, team_name, year=2025):
        """Get the latest statistics for a team"""
        team_data = self.data[
            (self.data['TEAM'] == team_name) & 
            (self.data['YEAR'] == year)
        ]
        
        if team_data.empty:
            return None
            
        return team_data[self.features].values[0]
        
    def get_tournament_probability(self, team_name):
        """Calculate a team's probability of winning the entire tournament"""
        team_stats = self.get_team_stats(team_name)
        if team_stats is None:
            return None
            
        # Get all teams from 2025 for normalization
        teams_2025 = self.data[self.data['YEAR'] == 2025]
        raw_probs = []
        
        # Calculate raw probabilities for all teams
        for _, team in teams_2025.iterrows():
            team_stats_2025 = self.get_team_stats(team['TEAM'])
            if team_stats_2025 is not None:
                team_stats_scaled = self.scaler.transform([team_stats_2025])
                raw_prob = self.model.predict_proba(team_stats_scaled)[0][1]
                raw_probs.append(raw_prob)
        
        # Calculate normalized probability for the requested team
        team_stats_scaled = self.scaler.transform([team_stats])
        team_raw_prob = self.model.predict_proba(team_stats_scaled)[0][1]
        
        # Add a small constant to all probabilities to ensure non-zero values
        min_prob = 0.001  # 0.1% minimum probability
        raw_probs = [max(p, min_prob) for p in raw_probs]
        team_raw_prob = max(team_raw_prob, min_prob)
        
        total_prob = sum(raw_probs)
        team_prob = (team_raw_prob / total_prob) * 100
        
        return {
            'team': team_name,
            'probability': round(team_prob, 2),
            'stats': dict(zip(self.features, team_stats))
        }
        
    def predict_2025_champion(self):
        """Predict the champion for 2025"""
        # Get all teams from 2025
        teams_2025 = self.data[self.data['YEAR'] == 2025]
        
        # Calculate raw probabilities for all teams
        predictions = []
        raw_probs = []
        for _, team in teams_2025.iterrows():
            team_name = team['TEAM']
            team_stats = self.get_team_stats(team_name)
            if team_stats is not None:
                team_stats_scaled = self.scaler.transform([team_stats])
                raw_prob = self.model.predict_proba(team_stats_scaled)[0][1]
                raw_probs.append(raw_prob)
                predictions.append({
                    'team': team_name,
                    'raw_probability': raw_prob,
                    'stats': dict(zip(self.features, team_stats))
                })
        
        # Add a small constant to all probabilities to ensure non-zero values
        min_prob = 0.001  # 0.1% minimum probability
        raw_probs = [max(p, min_prob) for p in raw_probs]
        
        # Normalize probabilities to sum to 100%
        total_prob = sum(raw_probs)
        for pred in predictions:
            pred['probability'] = round((max(pred['raw_probability'], min_prob) / total_prob) * 100, 2)
            del pred['raw_probability']  # Remove raw probability from output
        
        # Sort by probability
        predictions.sort(key=lambda x: x['probability'], reverse=True)


        total = 0
        for i, pred in enumerate(predictions, 1):
            total += pred['probability']
            
        return predictions

# Create a singleton instance
predictor = MarchMadnessPredictor() 