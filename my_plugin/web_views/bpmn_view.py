from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

from my_plugin.bpmn_to_dag_transformer import BPMNToAirflowTransformer

bpmn_blueprint = Blueprint(
    "bpmn",  # Blueprint name
    __name__,
    url_prefix="/my_plugin/bpmn",
)

# Enable CORS
CORS(bpmn_blueprint)


# Define the API route
@bpmn_blueprint.route("/preview", methods=["POST"])
@csrf.exempt
def execute_sql_endpoint():
    """
    API endpoint to execute a SQL query.
    """
    try:
        # Get JSON data from the request
        data = request.get_json()
        dag_id = data.get("dag_id")
        bpmn_xml = data.get("bpmn_xml")
        transformer = BPMNToAirflowTransformer(None, bpmn_xml)
        dag = transformer.generate_airflow_dag(dag_id)
        return jsonify({"status": "success", "data": dag}), 200

    except Exception as e:
        print(e)

        return jsonify({"status": "error", "message": str(e)}), 500
