import os

from flask import Blueprint, send_from_directory

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
    folder = os.path.join(os.path.dirname(__file__), STATIC_FOLDER)
    return send_from_directory(folder, "index.html")
