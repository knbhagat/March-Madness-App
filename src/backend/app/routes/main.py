# mypy: disable-error-code=import-not-found
from flask import Blueprint, jsonify, abort
from app import db

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def hello_world():
    return jsonify({"message": "Hello, World!"})


# Dummy route to trigger a 500 error
@main_bp.route('/some-500-error-route')
def some_500_error_route():
    abort(500)

@main_bp.route("/db_test")
def db_test():
    try:
        db.session.execute("SELECT 1")
        return "✅ Database connection successful!"
    except Exception as e:
        return f"❌ Database connection failed: {e}"

@main_bp.route("/init_db")
def init_db():
    try:
        db.create_all()
        return "✅ Tables created!"
    except Exception as e:
        return f"❌ Error: {str(e)}"

