# mypy: disable-error-code="import-not-found, import-untyped"
from flask import Blueprint, request, jsonify, session
from app import db, api_key, mm_tournament_id, prev_mm_tournament_id
from app.models.bracket import Bracket
from app.models.user import User
import datetime
import requests
from flask import current_app as app
from sqlalchemy import func
from app.scoring import score_bracket


bracket_bp = Blueprint('bracket', __name__)


@bracket_bp.route('/score_bracket', methods=['POST'])
def score_user_bracket():
    """
    Calculates the score of a user's bracket by comparing it with the live bracket.
    
    Returns:
        JSON response containing the calculated score
    """
    # Verify the user.
    user, mes, errNum = verify_user()
    if not user:
        return mes, errNum

    data = request.get_json()
    user_bracket = data.get('user_bracket')
    if not user_bracket:
        return (
            jsonify({'error': 'user_bracket is required'}),
            400,
        )
    
    # Get live bracket data and calculate score
    live_bracket = get_live_bracket_data()
    score = score_bracket(user_bracket, live_bracket)
    return jsonify({'score': score}), 200


def get_live_bracket_data():
    """
    Fetches the current live bracket data from the SportRadar API.
    
    Returns:
        JSON response containing the live bracket data
    """
    url = f"https://api.sportradar.com/ncaamb/trial/v8/en/tournaments/{mm_tournament_id}/schedule.json?api_key={api_key}"
    headers = {"accept": "application/json"}
    response = requests.get(url, headers=headers)
    return response.json()


# Returns live bracket from API
@bracket_bp.route('/get_bracket', methods=['GET'])
def get_realtime_bracket():
    """
    Endpoint to retrieve the current live bracket data.
    
    Returns:
        JSON response containing the live bracket data
    """
    data = get_live_bracket_data()
    return jsonify(data)


def get_bracket_template_data():
    """
    Fetches and processes the bracket template data from the SportRadar API.
    This includes organizing teams by region and creating the initial bracket structure.
    
    Returns:
        Dictionary containing the formatted bracket template data
    """
    url = f"https://api.sportradar.com/ncaamb/trial/v8/en/tournaments/{mm_tournament_id}/schedule.json?api_key={api_key}"
    headers = {"accept": "application/json"}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None

    data = response.json()

    # Find first round data from API response
    first_round = next((r for r in data['rounds'] if r['name'] == 'First Round'), None)
    if not first_round:
        return None

    # Map region indices to region names
    region_map = {0: "SOUTH", 1: "MIDWEST", 2: "EAST", 3: "WEST"}
    region_seeds = {region: [] for region in region_map.values()}

    # Process each region's games
    for i, region in enumerate(first_round.get("bracketed", [])):
        region_name = region_map.get(i, f"Region {i}")
        games = region.get("games", [])
        # Sort games by game number
        games.sort(key=lambda g: int(g.get("title", "Game 99").split("Game ")[-1]))
        
        # Create seed objects for each game
        for game_index, game in enumerate(games):
            seed = {
                "id": game_index + 1,
                "date": game.get("scheduled", ""),
                "teams": [
                    {
                        "name": game.get("home", {}).get("name", "TBD"),
                        "seed": game.get("home", {}).get("seed"),
                    },
                    {
                        "name": game.get("away", {}).get("name", "TBD"),
                        "seed": game.get("away", {}).get("seed"),
                    },
                ],
            }
            region_seeds[region_name].append(seed)

    # Construct final bracket structure
    bracket = {
        "id": int(datetime.datetime.now().timestamp()),
        "title": "March Madness Bracket",
        "regions": region_seeds,
    }

    return bracket


@bracket_bp.route('/generate_bracket_template', methods=['GET'])
def generate_bracket_template():
    """
    Endpoint to generate a new bracket template.
    
    Returns:
        JSON response containing the bracket template data
    """
    bracket = get_bracket_template_data()
    if not bracket:
        return jsonify({'error': 'Failed to get data from API'}), 500
    return jsonify(bracket), 200


@bracket_bp.route('/get_user_bracket_id', methods=['GET'])
def get_bracket_id():
    """
    Retrieves the next available bracket ID for a user.
    
    Returns:
        JSON response containing the next bracket number
    """
    user, mes, errNum = verify_user()
    if user == None:
        return mes, errNum
    max_bracket = (
        db.session.query(func.max(Bracket.bracket_number))
        .filter_by(id=user.id)
        .scalar()
    )
    next_bracket_number = (max_bracket or 0) + 1
    return jsonify({'next_bracket_number': next_bracket_number})


@bracket_bp.route('/get_user_bracket_numbers', methods=['GET'])
def get_user_bracket_numbers():
    """
    Retrieves all bracket numbers associated with the current user.
    
    Returns:
        JSON response containing an array of bracket numbers
    """
    user, mes, errNum = verify_user()
    if user is None:
        return mes, errNum

    bracket_numbers = (
        db.session.query(Bracket.bracket_number)
        .filter_by(id=user.id)
        .order_by(Bracket.bracket_number.asc())
        .all()
    )

    bracket_numbers = [bn[0] for bn in bracket_numbers]

    return (
        jsonify(
            {
                'message': 'Bracket numbers retrieved successfully',
                'bracket_numbers': bracket_numbers,
            }
        ),
        200,
    )


# Returns users bracket that has already been created
@bracket_bp.route('/get_user_bracket/<int:bracket_number>', methods=['GET'])
def get_user_bracket(bracket_number):
    """
    Retrieves a specific user bracket by bracket number.
    
    Args:
        bracket_number: The number of the bracket to retrieve
        
    Returns:
        JSON response containing the bracket data and selection
    """
    user, mes, errNum = verify_user()
    if user == None:
        return mes, errNum

    bracket = Bracket.query.filter_by(id=user.id, bracket_number=bracket_number).first()
    if not bracket:
        return jsonify({'error': 'Bracket not found'}), 404

    return (
        jsonify(
            {
                'message': 'Bracket retrieved successfully',
                'selection': bracket.bracket_selection.get('selection'),
                'bracket': bracket.bracket_selection.get('bracket')
            }
        ),
        200,
    )


# Created User Bracket
@bracket_bp.route('/create_user_bracket', methods=['POST'])
def create_user_bracket():
    """
    Creates or updates a user's bracket.
    
    Returns:
        JSON response indicating success or failure of the operation
    """
    user, mes, errNum = verify_user()
    if user == None:
        return mes, errNum

    data = request.get_json()
    bracket_number = data.get('bracket_number')
    bracket_selection = data.get("bracket_selection")
    
    # Construct new bracket with parsed data
    new_bracket = { 
        "bracket" : build_parsed_bracket(bracket_number, bracket_selection), 
        "selection" : bracket_selection
    }

    if not bracket_number or not bracket_selection:
        return (
            jsonify({'error': 'Bracket number and bracket selection are required'}),
            400,
        )

    # Check for existing bracket
    existing_bracket = Bracket.query.filter_by(
        id=user.id, bracket_number=bracket_number
    ).first()

    if existing_bracket:
        # Update existing bracket
        existing_bracket.bracket_selection = new_bracket
        db.session.commit()
        return (
            jsonify(
                {
                    'message': 'Bracket updated successfully',
                    'bracket': new_bracket,
                }
            ),
            200,
        )

    # Create new bracket
    new_user_bracket = Bracket(
        id=user.id, bracket_number=bracket_number, bracket_selection=new_bracket
    )
    db.session.add(new_user_bracket)
    db.session.commit()
    return (
        jsonify(
            {'message': 'Bracket created successfully', 'bracket': new_bracket}
        ),
        201,
    )


# User Verification
def verify_user():
    """
    Verifies the user's authentication token and retrieves user information.
    
    Returns:
        Tuple containing (user object, error message, error number)
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, jsonify({'error': 'Authorization header missing'}), 401

    token = auth_header.split(" ")[1] if len(auth_header.split()) > 1 else None
    if not token:
        return None, jsonify({'error': 'Token missing'}), 401

    user_id = token
    user = User.query.get(user_id)
    if not user:
        return None, jsonify({'error': 'User not found'}), 404

    return user, None, None


def build_parsed_bracket(id, selected_teams):
    """
    Builds a parsed bracket structure from selected teams.
    
    Args:
        id: The bracket ID
        selected_teams: Dictionary containing the selected teams
        
    Returns:
        Dictionary containing the parsed bracket structure
    """
    # Initialize bracket structure
    parsed_bracket = {
        "id": id,
        "title": f"March Madness Bracket {id}",
        "regions": {
            "EAST": {
                "rounds": [
                    {"title": "First Round", "seeds": []},
                    {"title": "Second Round", "seeds": []},
                    {"title": "Sweet 16", "seeds": []},
                    {"title": "Elite 8", "seeds": []},
                ]
            },
            "MIDWEST": {
                "rounds": [
                    {"title": "First Round", "seeds": []},
                    {"title": "Second Round", "seeds": []},
                    {"title": "Sweet 16", "seeds": []},
                    {"title": "Elite 8", "seeds": []},
                ]
            },
            "SOUTH": {
                "rounds": [
                    {"title": "First Round", "seeds": []},
                    {"title": "Second Round", "seeds": []},
                    {"title": "Sweet 16", "seeds": []},
                    {"title": "Elite 8", "seeds": []},
                ]
            },
            "WEST": {
                "rounds": [
                    {"title": "First Round", "seeds": []},
                    {"title": "Second Round", "seeds": []},
                    {"title": "Sweet 16", "seeds": []},
                    {"title": "Elite 8", "seeds": []},
                ]
            },
            "FINAL_FOUR": {
                "rounds": [
                    {"title": "Final Four", "seeds": []},
                    {"title": "National Championship", "seeds": []},
                ]
            },
        }
    }

    # Process selected teams and build bracket structure
    for key, value in selected_teams.items():
        parts = key.split("-")
        if len(parts) < 3:
            continue

        round_index_str = parts[0]
        _seed_index = parts[1]
        region_raw = "-".join(parts[2:]).strip()
        region_key = "FINAL_FOUR" if region_raw.upper() == "FINAL FOUR" else region_raw.upper()

        try:
            round_index = int(round_index_str)
        except ValueError:
            continue

        value_parts = value.split("-")
        if len(value_parts) < 3:
            continue

        team_seed_and_name = value_parts[0].split("_")
        if len(team_seed_and_name) < 2:
            continue

        team_seed = team_seed_and_name[0]
        team_name = "_".join(team_seed_and_name[1:]).strip()

        try:
            game_id = int(value_parts[1])
        except ValueError:
            continue

        # Create seed object for the selected team
        seed_obj = {
            "id": game_id,
            "winner": team_name,
            "teams": [{"name": team_name, "seed": team_seed}],
        }

        # Add seed to appropriate region and round
        if (
            region_key in parsed_bracket["regions"] and
            round_index < len(parsed_bracket["regions"][region_key]["rounds"])
        ):
            parsed_bracket["regions"][region_key]["rounds"][round_index]["seeds"].append(seed_obj)

    # Sort games by game ID
    for region in parsed_bracket["regions"].values():
        if "rounds" in region:
            for round_obj in region["rounds"]:
                round_obj["seeds"].sort(key=lambda seed: seed["id"])

    # Merge with first round teams
    data = get_bracket_template_data()
    if not data:
        return parsed_bracket

    # Update first round teams with template data
    regions = parsed_bracket.get("regions", {})
    for region_name, region in regions.items():
        if region_name != "FINAL_FOUR" and isinstance(region, dict) and "rounds" in region:
            first_round = region["rounds"][0]
            seeds = first_round.get("seeds", [])
            region_games = data.get("regions", {}).get(region_name, [])
            for i in range(len(seeds)):
                if i < len(region_games):
                    seeds[i]["teams"] = region_games[i].get("teams", [])

    return parsed_bracket


@bracket_bp.route('/format_bracket', methods=['GET'])
def format_bracket():
    """
    Formats the raw bracket data from the API into a structured format.
    
    Returns:
        JSON response containing the formatted bracket data
    """
    url = f"https://api.sportradar.com/ncaamb/trial/v8/en/tournaments/{mm_tournament_id}/schedule.json?api_key={api_key}"
    headers = {"accept": "application/json"}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to get data from API'}), 500
        
    data = response.json()
    if not data:
        return jsonify({'error': 'Failed to get data from API'}), 500
    
    round_obj_array = []
    region_order = ["EAST", "MIDWEST", "SOUTH", "WEST"]

    # Process each round of the tournament
    for idx1, round_data in enumerate(data.get('rounds', [])):
        if idx1 != 0:  # Skip First Four
            seed_array = []
            
            if idx1 < 5:  # Regional rounds
                # Sort regions based on predefined order
                bracketed = round_data.get('bracketed', [])
                bracketed.sort(key=lambda x: region_order.index(x['bracket']['name'].split()[0].upper()) 
                             if x['bracket']['name'].split()[0].upper() in region_order 
                             else len(region_order))

                # Process each region's games
                for region in bracketed:
                    games = region.get('games', [])
                    games.sort(key=lambda x: int(x['title'].split('Game ')[-1]))

                    for game in games:
                        # Create team objects with game information
                        team_info = {
                            "id": game['id'],
                            "location": f"{game['venue']['name']} ({game['venue']['city']}, {game['venue']['state']})",
                            "teams": [
                                {
                                    "name": game['home']['alias'],
                                    "seed": game['home']['seed']
                                },
                                {
                                    "name": game['away']['alias'],
                                    "seed": game['away']['seed']
                                }
                            ],
                            "homeScore": game['home_points'],
                            "awayScore": game['away_points'],
                            "date": datetime.datetime.fromisoformat(game['scheduled'].replace('Z', '+00:00')).strftime("%B %d, %Y"),
                            "region": region['bracket']['name'].split()[0].upper()
                        }
                        seed_array.append(team_info)
            else:  # Final Four and Championship games
                for game in round_data.get('games', []):
                    team_info = {
                        "id": game['id'],
                        "location": f"{game['venue']['name']} ({game['venue']['city']}, {game['venue']['state']})",
                        "teams": [
                            {
                                "name": game['home']['alias'],
                                "seed": game['home']['seed']
                            },
                            {
                                "name": game['away']['alias'],
                                "seed": game['away']['seed']
                            }
                        ],
                        "region": "FINAL FOUR",
                        "homeScore": game['home_points'],
                        "awayScore": game['away_points'],
                        "date": datetime.datetime.fromisoformat(game['scheduled'].replace('Z', '+00:00')).strftime("%B %d, %Y")
                    }
                    seed_array.append(team_info)

            # Create round object
            round_obj = {
                "title": round_data['name'],
                "seeds": seed_array
            }
            round_obj_array.append(round_obj)

    # Create final bracket object
    bracket_obj = {
        "title": data['name'],
        "id": 0,
        "rounds": round_obj_array,
    }

    return jsonify(bracket_obj), 200
