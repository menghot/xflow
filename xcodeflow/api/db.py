import sqlalchemy
from airflow.hooks.base import BaseHook
from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

from xcodeflow.connection_plugin import ConnectionAccessPlugin

db_blueprint = Blueprint(
    "db",  # Blueprint name
    __name__,
    url_prefix="/xcodeflow/api/db",
)

CORS(db_blueprint)


@db_blueprint.route("/connections", methods=["GET"])
@csrf.exempt
def get_connections():
    # {
    #     title: string;
    # key: string;
    # isLeaf?: boolean;
    # connType?: string;
    # children?: DataNode[];
    # }
    # {"conn_type": "postgres", "connection_id": "postgres_default", "description": "", "extra": {}, "host": "127.0.0.1", "login": "airflow", "port": 5432, "schema": "airflow"}
    return [{"title": conn["connection_id"],
             "key": conn["connection_id"],
             "conn_type": conn["conn_type"],
             "isLeaf": False} for conn in ConnectionAccessPlugin.list_connections()]


@db_blueprint.route('/tree', methods=['GET'])
@csrf.exempt
def build_tree_api():
    connection_id = request.args.get('connection_id')
    if not connection_id:
        return jsonify({"error": "connection_id is required"}), 400
    try:
        tree = build_tree(connection_id)
        return jsonify(tree), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def fetch_schemas_and_tables(connection):
    if connection.conn_type == 'postgres':
        conn_type = 'postgresql'
    else:
        conn_type = connection.conn_type

    # Parse the connection URL
    conn_url = f"{conn_type}://{connection.login}:{connection.password}@{connection.host}:{connection.port}/{connection.schema}"

    engine = sqlalchemy.create_engine(conn_url)

    """Fetch schemas and tables from the database."""
    schemas = []
    tables = {}
    with engine.connect() as conn:
        result = conn.execute("SELECT schema_name FROM information_schema.schemata;")
        if result.cursor:
            schemas = [row[0] for row in result.cursor.fetchall()]

        for schema in schemas:
            result = conn.execute(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}';")
            if result.cursor:
                tables[schema] = [row[0] for row in result.cursor.fetchall()]

    return schemas, tables


def build_tree(connection_id):
    """Builds the tree structure."""
    conn = BaseHook.get_connection(connection_id)
    print(conn)
    schemas, tables = fetch_schemas_and_tables(conn)

    root = {
        "title": conn.conn_id,
        "key": conn.conn_id,
        "type": "connection",
        "children": []
    }

    for schema in schemas:
        schema_node = {
            "title": schema,
            "type": "schema",
            "key": f"{conn.conn_id}/{schema}",
            "children": []
        }
        for table in tables[schema]:
            table_node = {
                "title": table,
                "type": "table",
                "key": f"{conn.conn_id}/{schema}/{table}",
                "isLeaf": True
            }
            schema_node["children"].append(table_node)

        root["children"].append(schema_node)

    return root
