import requests
import csv

API_KEY = "85b51a6e502839ce10e727560c099431"  # Only 500 Requests per month
SPORT = "basketball_ncaab"
REGION = "us"
URL = f"https://api.the-odds-api.com/v4/sports/{SPORT}/odds/?apiKey={API_KEY}&regions={REGION}&markets=h2h,spreads"

response = requests.get(URL)

if response.status_code == 200:
    odds_data = response.json()
    
    csv_filename = "game_odds.csv"

    # Open CSV file for writing
    with open(csv_filename, mode="w", newline="") as file:
        writer = csv.writer(file)
        
        # Write the header row
        writer.writerow(["Home Team", "Away Team", "Bookmaker", "Bet Type", "Team", "Odds"])

	# Write the game data
        for game in odds_data:
            home_team = game["home_team"]
            away_team = game["away_team"]
            for bookmaker in game["bookmakers"]:
                bookmaker_name = bookmaker["title"]
                for market in bookmaker["markets"]:
                    bet_type = market["key"]
                    for outcome in market["outcomes"]:
                        writer.writerow([home_team, away_team, bookmaker_name, bet_type, outcome["name"], outcome["price"]])

    print(f"Data saved to {csv_filename}")

else:
    print("Error:", response.json())
