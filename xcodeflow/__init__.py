import os

AIRFLOW_HOME = os.getenv('AIRFLOW_HOME', os.path.expanduser('~/airflow'))
print(AIRFLOW_HOME)
