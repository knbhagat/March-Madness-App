from flask import Flask, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, login_required

app = Flask(__name__)
app.secret_key = 'secret'
login_manager = LoginManager(app)

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

@app.route('/login')
def login():
    user = User(id=1)
    login_user(user)
    return redirect(url_for('protected'))

@app.route('/protected')
@login_required
def protected():
    return "You are logged in!"
