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
    # Verify the user.
    user, mes, errNum = verify_user()
    if not user:
        return mes, errNum

    data = request.get_json()
    user_bracket = data.get('user_bracket')
    live_bracket = data.get('live_bracket')
    if not user_bracket or not live_bracket:
        return (
            jsonify({'error': 'Both user_bracket and live_bracket are required'}),
            400,
        )
    # Calculate the score by comparing the user bracket with the live bracket.
    score = score_bracket(user_bracket, live_bracket)
    return jsonify({'score': score}), 200


# Returns live bracket from API
@bracket_bp.route('/get_bracket', methods=['GET'])
def get_realtime_bracket():
    # switch out mm_tournament_id, with prev_mm_tournament_id dependent on what you need
    # to understand/use
    url = f"https://api.sportradar.com/ncaamb/trial/v8/en/tournaments/{mm_tournament_id}/schedule.json?api_key={api_key}"  # noqa: E501
    headers = {"accept": "application/json"}
    response = requests.get(url, headers=headers)
    return jsonify(response.json())


@bracket_bp.route('/generate_bracket_template', methods=['GET'])
def generate_bracket_template():
    # copied from above
    url = f"https://api.sportradar.com/ncaamb/trial/v8/en/tournaments/{mm_tournament_id}/schedule.json?api_key={api_key}"  # noqa: E501
    headers = {"accept": "application/json"}  # <-- include this
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to get data from API'}), 500

    data = response.json()

    # loops and filters API to find first round
    first_round = next((r for r in data['rounds'] if r['name'] == 'First Round'), None)
    if not first_round:
        return jsonify({'error': 'First Round not found'}), 404

    # values from API
    region_map = {0: "SOUTH", 1: "MIDWEST", 2: "EAST", 3: "WEST"}

    region_seeds = {region: [] for region in region_map.values()}

    # Loop through each bracketed region from the API's First Round data
    for i, region in enumerate(first_round.get("bracketed", [])):
        # gets from region_map
        region_name = region_map.get(i, f"Region {i}")
        # sort games - copies Krishaan's code but in python
        games = region.get("games", [])
        games.sort(key=lambda g: int(g.get("title", "Game 99").split("Game ")[-1]))
        # Build a Seed - one of 8 games in reigon
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

    # builds bracket structure to send to frontend
    bracket = {
        "id": int(datetime.datetime.now().timestamp()),
        "title": "March Madness Bracket",
        "regions": region_seeds,
    }

    return jsonify(bracket), 200


@bracket_bp.route('/get_user_bracket_id', methods=['GET'])
def get_bracket_id():
    user, mes, errNum = verify_user()
    if user == None:
        return mes, errNum
    max_bracket = (
        db.session.query(func.max(Bracket.bracket_number))
        .filter_by(id=user.id)
        .scalar()
    )
    # If user has no brackets, start from 1
    next_bracket_number = (max_bracket or 0) + 1
    return jsonify({'next_bracket_number': next_bracket_number})


@bracket_bp.route('/get_user_bracket_numbers', methods=['GET'])
def get_user_bracket_numbers():
    user, mes, errNum = verify_user()
    if user is None:
        return mes, errNum

    # all bracket_numbers (# of brackets) for the user
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
    # User Verification
    user, mes, errNum = verify_user()
    if user == None:
        return mes, errNum

    # Fetch the user's bracket by user_id and bracket_number
    bracket = Bracket.query.filter_by(id=user.id, bracket_number=bracket_number).first()
    if not bracket:
        return jsonify({'error': 'Bracket not found'}), 404

    print(bracket)

    # Return the bracket selection data
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
    # User Verification
    user, mes, errNum = verify_user()
    if user == None:
        return mes, errNum
    # Get bracket number  and bracket selection
    data = request.get_json()
    bracket_number = data.get('bracket_number')
    bracket_selection = data.get("bracket_selection")
    
    # Will need to reconstruct the bracket
    new_bracket = { 
        "bracket" : build_parsed_bracket(bracket_number, bracket_selection), 
        "selection" : bracket_selection
    }

    if not bracket_number or not bracket_selection:
        return (
            jsonify({'error': 'Bracket number and bracket selection are required'}),
            400,
        )

    # Check if the user already has a bracket for the given bracket_number
    existing_bracket = Bracket.query.filter_by(
        id=user.id, bracket_number=bracket_number
    ).first()


    if existing_bracket:
        # If the bracket exists, we can either update
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

    # If the bracket doesn't exist, create a new one
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
    # Extract the token from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, jsonify({'error': 'Authorization header missing'}), 401

    # The token should be in the form 'Bearer <token>'
    token = auth_header.split(" ")[1] if len(auth_header.split()) > 1 else None
    if not token:
        return None, jsonify({'error': 'Token missing'}), 401

    # Use the token as the user ID (or replace with your preferred method)
    user_id = token

    # Retrieve the user from the database using the provided user_id
    user = User.query.get(user_id)
    if not user:
        return None, jsonify({'error': 'User not found'}), 404

    return user, None, None


def build_parsed_bracket(id, selected_teams):
    parsed_bracket = {
        "id": id,
        "title": "March Madness Bracket",
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

    for key, value in selected_teams.items():
        parts = key.split("-")
        if len(parts) < 3:
            continue  # invalid key format, skip

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
            continue  # invalid value format, skip

        team_seed_and_name = value_parts[0].split("_")
        if len(team_seed_and_name) < 2:
            continue  # invalid team format

        team_seed = team_seed_and_name[0]
        team_name = "_".join(team_seed_and_name[1:]).strip()

        try:
            game_id = int(value_parts[1])
        except ValueError:
            continue

        seed_obj = {
            "id": game_id,
            "winner": team_name,
            "teams": [{"name": team_name, "seed": team_seed}],
        }

        if (
            region_key in parsed_bracket["regions"] and
            round_index < len(parsed_bracket["regions"][region_key]["rounds"])
        ):
            parsed_bracket["regions"][region_key]["rounds"][round_index]["seeds"].append(seed_obj)

    return parsed_bracket


@bracket_bp.route('/format_bracket', methods=['GET'])
def format_bracket():
    # Get the raw bracket data from the API
    url = f"https://api.sportradar.com/ncaamb/trial/v8/en/tournaments/{mm_tournament_id}/schedule.json?api_key={api_key}"
    headers = {"accept": "application/json"}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to get data from API'}), 500
        
    data = response.json()
    round_obj_array = []
    region_order = ["EAST", "MIDWEST", "SOUTH", "WEST"]

    for idx1, round_data in enumerate(data.get('rounds', [])):
        # Skip the First Four
        if idx1 != 0:
            seed_array = []
            
            if idx1 < 5:
                # Sort regions based on predefined order
                bracketed = round_data.get('bracketed', [])
                bracketed.sort(key=lambda x: region_order.index(x['bracket']['name'].split()[0].upper()) 
                             if x['bracket']['name'].split()[0].upper() in region_order 
                             else len(region_order))

                for region in bracketed:
                    # Sort games by game number
                    games = region.get('games', [])
                    games.sort(key=lambda x: int(x['title'].split('Game ')[-1]))

                    for game in games:
                        # Create team objects
                        away_team = {
                            "name": game['away']['alias'],
                            "seed": game['away']['seed']
                        }
                        home_team = {
                            "name": game['home']['alias'],
                            "seed": game['home']['seed']
                        }
                        
                        # Create seed object
                        team_info = {
                            "id": game['id'],
                            "location": f"{game['venue']['name']} ({game['venue']['city']}, {game['venue']['state']})",
                            "teams": [home_team, away_team],
                            "homeScore": game['home_points'],
                            "awayScore": game['away_points'],
                            "date": datetime.datetime.fromisoformat(game['scheduled'].replace('Z', '+00:00')).strftime("%B %d, %Y"),
                            "region": region['bracket']['name'].split()[0].upper()
                        }
                        seed_array.append(team_info)
            else:
                # Handle Final Four and Championship games
                for game in round_data.get('games', []):
                    away_team = {
                        "name": game['away']['alias'],
                        "seed": game['away']['seed']
                    }
                    home_team = {
                        "name": game['home']['alias'],
                        "seed": game['home']['seed']
                    }
                    
                    team_info = {
                        "id": game['id'],
                        "location": f"{game['venue']['name']} ({game['venue']['city']}, {game['venue']['state']})",
                        "teams": [home_team, away_team],
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
