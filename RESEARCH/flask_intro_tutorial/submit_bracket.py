from flask import Flask, request, jsonify

app = Flask(__name__)

# Example storage (use a database in production)
brackets = {}

@app.route('/api/bracket', methods=['POST'])
def submit_bracket():
    data = request.json
    user_id = data.get("user_id")
    brackets[user_id] = data.get("bracket")
    return jsonify({"message": "Bracket submitted!"})

@app.route('/api/bracket/<user_id>', methods=['GET'])
def get_bracket(user_id):
    return jsonify(brackets.get(user_id, {"message": "Bracket not found"}))

if __name__ == '__main__':
    app.run(debug=True)
