# March Madness Backend

## AI Implementation Overview

The backend implements a sophisticated machine learning system for predicting March Madness tournament outcomes. The system leverages historical data and advanced statistical analysis to provide accurate probability assessments for each team's championship chances.

### Machine Learning Architecture

#### Model Selection
- **Algorithm**: Random Forest Classifier
- **Rationale**: Chosen for its ability to handle non-linear relationships and provide feature importance insights
- **Configuration**: 
  - 100 estimators
  - Random state fixed for reproducibility
  - Balanced class weights to handle imbalanced data

#### Feature Engineering
The model utilizes four key statistical metrics:
1. **NET RPI**: NCAA Evaluation Tool Rating Percentage Index
   Combines results, strength of schedule, game location, and efficiency to rank teams.

2. **RESUME**: Team's overall performance metrics
   Summarizes a team's record, key wins/losses, and strength of schedule.

3. **B POWER**: Team's strength rating
   Evaluates team quality based on efficiency and performance against all opponents.

4. **R SCORE**: Advanced performance score
   Combines offensive, defensive, and efficiency metrics into a single team rating.

#### Data Preprocessing
- Standardization of features using StandardScaler
- Handling of missing values and data normalization
- Historical data spanning from 2008-2024 for training

### Prediction Pipeline

1. **Data Loading**
   - Historical tournament data ingestion
   - Real-time team statistics integration
   - Data validation and cleaning

2. **Model Training**
   - Feature scaling and normalization
   - Cross-validation for model robustness
   - Feature importance analysis

3. **Prediction Generation**
   - Probability calculation for each team
   - Normalization of probabilities to ensure sum to 100%
   - Confidence scoring for predictions

### API Endpoints

#### GET /api/predictions
Returns championship probabilities for all teams, including:
- Top 9 teams with individual probabilities
- "Field" category combining remaining teams
- Statistical breakdown for each team

### Technical Implementation

```python
class MarchMadnessPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.features = ['NET RPI', 'RESUME', 'B POWER', 'R SCORE']
```

### Performance Metrics

The model's performance is evaluated using:
- Historical prediction accuracy
- Feature importance analysis
- Probability calibration

### Future Enhancements

1. **Model Improvements**
   - Integration of additional features
   - Ensemble methods for improved accuracy
   - Real-time model updates

2. **API Enhancements**
   - Additional prediction endpoints
   - Historical performance tracking
   - Advanced statistical analysis

## Setup and Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the server:
```bash
python app.py
```

## API Documentation

### GET /api/predictions
Returns championship probabilities for all teams.

**Response Format:**
```json
[
  {
    "teamName": "Team Name",
    "winPercentage": 25.5
  }
]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details

## File Structure

app/models - contains SQL alchemy classes for each table (data layer)
app/routes - contains actual route logic (controller layer)
app/__init__.py contains init logic
app/error_handler contains error set up

run.py - entry point for app
config.py  - config and env vars

## Endpoints

# Default
# /

"Hello world"

returns on success:
{
    "message": "Hello, World!"
}

# Register - register a new account into DB
# /auth/register 

body: 
{
    "email" : "example@gmail.com",
    "password" : "password"
}

return on success:
{
    "message": "User registered",
    "user": {
        "email": "example@gmail.com",
        "password": "password"
    }
}

return on fail - this needs to be fixed

{
    "message": "Internal Server Error"
}

# Login - login with existing credentials
# /auth/login

body: 
{
    "email" : "example@gmail.com",
    "password" : "password"
}

returns on success:

{
    "message": "Login successful",
    "token": "generated_token_id"
}

on fail:
{
    "message": "Invalid credentials"
}

## Bracket 

# Get Bracket - get live bracket
# /get_bracket [("GET")]

on success, returns:

## IMPORTANT to understand structure

# API FOR THIS YEARS TOURNEY --> What we have so far

{
    "rounds": [
        { 
            "name": "First Four",
            "games" : [ ] // 4 items
            "sequence": 1
        },
        {
            "bracketed" : [ ], // empty but will fill up as games start
            "name": "First Round",
            "sequence": 2,
            "games" : [ // contains 32 items
                { }, // contains 10 items
                { 
                    "away" : {
                        "alias" : string,
                        "name" : string,
                    },
                    "home" : {
                        "alias" : string,
                        "name" : string,
                    },
                    "scheduled": "2025-03-20T17:00:00+00:00",
                    "status": "time-tbd",
                    "title": "Midwest Regional - First Round - Game 1",
                    "venue" ?: {
                        "name" : ARENA NAME,
                        "state" : State abbreviations
                    }
                }
            ] 
        }, 
        ...
        {
            "name": "National Championship",
            "games" : [ ] // 1 item
            "sequence": 7
        }
    ]
}

# API For Last Years Tourney (Assumption that this will happen)

{
    "rounds": [ // same structure
        { },
        { // overview of 1st round
            "games" : [ ], // becomes empty
            "name" : "First Round", // Same as before
            "sequence" : 1, // Same as before
            "bracketed": [ // 4 items in all bracketed objects except for first 4 (correlate regions of games)
                { }, // contains 2 items
                {
                    "bracket": {
                        name: "Midwest Regional",
                        rank: 3 // only 4 ranks for 4 regions
                    },
                    "games" : [ // 8 items for each game in region
                        { }, // 15 items now rather than 10
                        {
                            "away": {
                                "seed" : 9,
                                ... // same as before
                                "source" : { // contains information of team from round prior

                                }
                            },
                            "home": {
                                "seed" : 8,
                                ... // same as before
                                "source" : { // contains information of team from round prior

                                }
                            },
                            "broadcasts" : [
                                "network": TBS
                            ]
                            "home_points" : NUMBER,
                            "away_points" : NUMBER,
                            "title" : "Midwest Regional - First Round - Game ",
                            "status" : closed,
                            "venue" : { 
                                // same as before
                            },
                        },
                        ...
                    ],
                },
                ...
            ]
        }, 
        ....
        // once we get to final 4, bracketed is empty and games is not empty again,
        // here I will highlight the additional fields added to games, that we will use once they are updated
        { 
            bracketed: [ ],
            "name" : "Final Four", // Same as before
            "sequence" : String, // Same as before
            games: [
                    {
                    "away": {
                        "seed" : 11,
                        ... // same as before
                        "source" : { // contains information of team from round prior

                        }
                    },
                    "home": {
                        "seed" : 1,
                        ... // same as before
                        "source" : { // contains information of team from round prior

                        }
                    },
                    "broadcasts" : [
                        "network": TBS
                    ]
                    "home_points" : NUMBER,
                    "away_points" : NUMBER,
                    "title" : "Final Four - Semifinals - Game 2",
                    "status" : closed,
                    "venue" : { // same as before

                    },
                    ...
                }
            ]
        }
    ]
}

# Get User Bracket - gets a premade user bracket
# /get_user_bracket/<int:bracket_number> [("GET")]

on success, returns:

{
    "message": "Bracket Retrieved Successfully",
    "bracket": JSON object of bracket selection (format similar to prev request)

}

on failure, returns:

{
    "error": ...
}


# Create Bracket - creates a user bracket
# /create_user_bracket ["(POST)"]

body: {
    bracket_number: INTEGER
    bracket_selection: JSON object of bracket selection
}

on success, returns:

{
    "message": "Bracket created successfully",
    "bracket": JSON Object of bracket selection
}

on failure, returns:

{
    error: ...
}

#  How to test

localhost:8000{endpoint}

example:  
in postman
GET localhost:8000/

POST localhost:8000/auth/login
body:
{
    "email" : "example@gmail.com",
    "password" : "password"
} 
