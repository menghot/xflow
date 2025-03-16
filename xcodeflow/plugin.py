import sys

print(sys.path)

from airflow.plugins_manager import AirflowPlugin
from xcodeflow.web.home import home_blueprint
from xcodeflow.api.sql import api_blueprint
from xcodeflow.api.bpmn import bpmn_blueprint
from xcodeflow.api.conn import db_blueprint
from xcodeflow.api.file import file_blueprint
from xcodeflow.api.dag import dag_blueprint


class XcodeFlow(AirflowPlugin):
    name = "xcodeflow"
    flask_blueprints = [home_blueprint, api_blueprint, bpmn_blueprint, db_blueprint, file_blueprint, dag_blueprint]
