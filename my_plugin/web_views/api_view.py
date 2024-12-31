import sqlalchemy
from airflow.hooks.base import BaseHook
from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

api_blueprint = Blueprint(
    "api",  # Blueprint name
    __name__,
    url_prefix="/my_plugin/api",
)

# Enable CORS
CORS(api_blueprint)


def execute_sql(conn_id, sql):
    """
    Execute a SQL query using the given Airflow connection ID.
    """
    try:
        # Get connection details from Airflow
        connection = BaseHook.get_connection(conn_id)
        if connection.conn_type == 'postgres':
            conn_type = 'postgresql'
        else:
            conn_type = connection.conn_type

        # Parse the connection URL
        conn_url = f"{conn_type}://{connection.login}:{connection.password}@{connection.host}:{connection.port}/{connection.schema}"

        # Create a SQLAlchemy engine
        engine = sqlalchemy.create_engine(conn_url)

        # Execute the SQL query
        with engine.connect() as connection:
            result = connection.execute(sql)

            # Extract column headers
            headers = [col[0] for col in result.cursor.description]

            # Fetch all results as a list of dictionaries
            data = [dict(row) for row in result.fetchall()]

        return {"status": "success", "headers": headers, "data": data}

    except Exception as e:
        print(e)
        return {"status": "error", "message": str(e)}


# Define the API route
@api_blueprint.route("/sql/query", methods=["POST"])
@csrf.exempt
def execute_sql_endpoint():
    """
    API endpoint to execute a SQL query.
    """
    try:
        # Get JSON data from the request
        data = request.get_json()
        conn_id = data.get("conn_id")
        sql = data.get("sql")

        if not conn_id or not sql:
            return jsonify({"status": "error", "message": "conn_id and sql are required"}), 400

        # Execute the SQL query
        result = execute_sql(conn_id, sql)
        return jsonify(result)

    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500
