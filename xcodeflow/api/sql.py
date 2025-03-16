import sys

import sqlalchemy
from airflow.hooks.base import BaseHook
from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

from xcodeflow.conn_plugin import ConnectionAccessPlugin

api_blueprint = Blueprint(
    "api",  # Blueprint name
    __name__,
    url_prefix="/xcodeflow/api/sql",
)

# Enable CORS
CORS(api_blueprint)


# Define the API route
@api_blueprint.route("/query", methods=["POST"])
@csrf.exempt
def execute_sql_endpoint():
    """
    API endpoint to execute a SQL query.
    """
    try:
        # Get JSON data from the request
        data = request.get_json()
        conn_id = data.get("conn_id")
        print(conn_id)
        if not conn_id:
            # TODO: test only, fixme
            conn_id = 'postgres_default'

        sql = data.get("sql").strip()

        if not conn_id or not sql:
            return jsonify({"status": "error", "message": "conn_id and sql are required"}), 400

        # Execute the SQL query
        result = execute_sql(conn_id, sql)
        return jsonify(result)

    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500


def execute_sql(conn_id, sql):
    """
    Execute a SQL query using the given Airflow connection ID.
    """
    # Remove last ";" if exists
    if sql.endswith(';'):
        sql = sql[:-1]

    try:
        print("connections size: ", len(ConnectionAccessPlugin.list_connections()))

        # Get connection details from Airflow
        connection = BaseHook.get_connection(conn_id)
        print(connection, connection.conn_type)
        conn_url = f"{connection.conn_type}://{connection.login}:{connection.password}@{connection.host}:{connection.port}/{connection.schema}"
        if connection.conn_type == 'postgres':
            conn_type = 'postgresql'
            conn_url = f"{conn_type}://{connection.login}:{connection.password}@{connection.host}:{connection.port}/{connection.schema}"

        elif connection.conn_type == 'spark_jdbc' or connection.conn_type == 'spark_sql' or connection.conn_type == 'hiveserver2':
            conn_type = 'hive'
            conn_url = f"{conn_type}://{connection.host}:{connection.port}/{connection.schema}"

        elif connection.conn_type == 'trino':
            conn_type = 'trino'
            conn_url = f"{conn_type}://{connection.login}:@{connection.host}:{connection.port}/{connection.schema}?ssl=false"

        print(conn_url)

        # Create a SQLAlchemy engine
        engine = sqlalchemy.create_engine(conn_url)

        # Execute the SQL query
        with engine.connect() as conn:
            result = conn.execute(sql)
            print(result)
            # Extract column headers
            if result.cursor:
                headers = [col[0] for col in result.cursor.description]
                data = [dict(row) for row in result.fetchall()]
            else:
                headers = []
                data = []

        return {"status": "success", "headers": headers, "data": data}

    except Exception as e:
        print(e)
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    print(sys.path)
    print(execute_sql('trino_default', 'show catalogs;').values())
    print(execute_sql('postgres_default', 'select current_date').values())
    print(execute_sql('hiveserver2_default', 'select current_date').values())
