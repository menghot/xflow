import os

AIRFLOW_HOME = os.getenv('AIRFLOW_HOME', os.path.expanduser('~/airflow'))
DAG_HOME = os.path.join(AIRFLOW_HOME, "dags")
BPMN_HOME = os.path.join(AIRFLOW_HOME, "bpmn")

print(AIRFLOW_HOME, DAG_HOME, BPMN_HOME)
