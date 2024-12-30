import os
from pathlib import Path

from flask import Blueprint, request, jsonify, send_from_directory
from airflow.plugins_manager import AirflowPlugin
from airflow.www.app import csrf
from airflow.api_connexion import security

# Define a Flask Blueprint
# my_blueprint = Blueprint(
#     "my_view",  # Name of the blueprint
#     __name__,
#     url_prefix="/my_plugin",  # URL prefix for the view
# )

STATIC_FOLDER = '../static'

my_blueprint = Blueprint(
    "my_plugin",  # Blueprint name
    __name__,
    url_prefix="/my_plugin",
    static_folder=STATIC_FOLDER,  # Path to static files
    static_url_path="/"  # URL prefix for static files
)


# @my_blueprint.route("/")
# def index():
#     return render_template("index.html")

@my_blueprint.route("/")
def index():
    return send_from_directory(os.path.join(os.path.dirname(__file__), STATIC_FOLDER), "index.html")


# Define a route for the custom view
@my_blueprint.route("/hello", methods=["GET"])
def hello():
    """Example route that returns a greeting."""
    return jsonify({"message": "Hello from MyPlugin!"})


@my_blueprint.route("/sum", methods=["POST"])
@csrf.exempt
def calculate_sum():
    """Example route to calculate the sum of two numbers."""
    data = request.get_json()
    a = data.get("a", 0)
    b = data.get("b", 0)
    return jsonify({"result": a + b})
