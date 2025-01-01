import os
from urllib.parse import unquote

from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

from my_plugin.bpmn_to_dag_transformer import BPMNToAirflowTransformer

bpmn_blueprint = Blueprint(
    "bpmn",  # Blueprint name
    __name__,
    url_prefix="/my_plugin/api/bpmn",
)

# Enable CORS
CORS(bpmn_blueprint)


# Define the API route
@bpmn_blueprint.route("/preview", methods=["POST"])
@csrf.exempt
def preview():
    """
    API endpoint to execute a SQL query.
    """
    try:
        # Get JSON data from the request
        data = request.get_json()
        dag_id = data.get("dag_id")
        bpmn_xml = data.get("bpmn_xml")
        print(bpmn_xml + '-----------')
        transformer = BPMNToAirflowTransformer(None, bpmn_xml)
        dag = transformer.generate_airflow_dag(dag_id)
        print(dag + '-----------')
        return jsonify({"status": "success", "data": dag}), 200

    except Exception as e:
        print(e)

        return jsonify({"status": "error", "message": str(e)}), 500


@bpmn_blueprint.route("/deploy", methods=["POST"])
@csrf.exempt
def deploy():
    try:
        # Get JSON data from the request
        dag_id = request.args.get('dag_id')
        dag_id = unquote(dag_id) if dag_id else None
        bpmn_xml = request.data.decode('utf-8')
        transformer = BPMNToAirflowTransformer(None, bpmn_xml)
        dag = transformer.generate_airflow_dag(dag_id)

        # save to airflow home
        output_file = os.path.join(os.path.dirname(__file__), "../../dags", dag_id + ".py")

        with open(output_file, "w") as f:
            f.write(dag)
        print(f"DAG saved to {output_file}")
        return jsonify({"status": "success"}), 200

    except Exception as e:
        print(e)

        return jsonify({"status": "error", "message": str(e)}), 500
