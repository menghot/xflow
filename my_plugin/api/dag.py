import os

from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

dag_blueprint = Blueprint(
    "dag",  # Blueprint name
    __name__,
    url_prefix="/my_plugin/api/dag",
)

CORS(dag_blueprint)

dag_folder = os.path.join(os.path.dirname(__file__), "../../../dags")
dag_folder = os.path.abspath(dag_folder)


def build_file_tree(base_path):
    file_tree_nodes = []
    try:
        for item in os.listdir(base_path):
            # Skip the "__pycache__" folder
            if item == "__pycache__":
                continue
            item_path = os.path.join(base_path, item)
            simplified_path = os.path.abspath(item_path)  # Resolve the full canonical path
            node = {
                "title": item,
                "key": simplified_path,  # Use simplified path as the key
                "isLeaf": not os.path.isdir(item_path),
            }
            if os.path.isdir(item_path):
                node["children"] = build_file_tree(item_path)
            file_tree_nodes.append(node)
    except PermissionError:
        pass  # Ignore directories/files without permission
    return file_tree_nodes


@dag_blueprint.route("/file-tree", methods=["GET"])
@csrf.exempt
def get_file_tree():
    path = dag_folder
    if not path or not os.path.exists(path):
        return jsonify({"error": "Invalid or non-existent path"}), 400

    # Simplify and normalize the root path
    simplified_path = os.path.abspath(path)

    # Build the tree starting from the root
    root_node = {
        "title": os.path.basename(simplified_path) or simplified_path,  # Root folder/file name
        "key": simplified_path,
        "isLeaf": not os.path.isdir(simplified_path),
    }

    if os.path.isdir(simplified_path):
        root_node["children"] = build_file_tree(simplified_path)

    return jsonify([root_node])
