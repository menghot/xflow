import os

from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from my_plugin.connection_plugin import ConnectionAccessPlugin

from my_plugin.bpmn_to_dag_transformer import BPMNToAirflowTransformer

db_blueprint = Blueprint(
    "db",  # Blueprint name
    __name__,
    url_prefix="/my_plugin/api/db",
)

CORS(db_blueprint)


@db_blueprint.route("/connections", methods=["GET"])
@csrf.exempt
def get_connections():
    return ConnectionAccessPlugin.list_connections()
