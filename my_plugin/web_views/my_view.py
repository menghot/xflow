import os

from airflow.www.app import csrf
from flask import Blueprint, request, jsonify, send_from_directory


STATIC_FOLDER = '../static'

my_blueprint = Blueprint(
    "my_plugin",  # Blueprint name
    __name__,
    url_prefix="/my_plugin",
    static_folder=STATIC_FOLDER,  # Path to static files
    static_url_path="/"  # URL prefix for static files
)


@my_blueprint.route("/")
def index():
    return send_from_directory(os.path.join(os.path.dirname(__file__), STATIC_FOLDER), "index.html")


# Define a route for the custom view
@my_blueprint.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello from MyPlugin!"})


@my_blueprint.route("/sum", methods=["POST"])
@csrf.exempt
def calculate_sum():
    data = request.get_json()
    a = data.get("a", 0)
    b = data.get("b", 0)
    return jsonify({"result": a + b})
