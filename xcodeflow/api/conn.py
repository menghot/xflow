import sqlalchemy
from airflow.hooks.base import BaseHook
from airflow.www.app import csrf
from flask import Blueprint, request, jsonify
from flask_cors import CORS

from xcodeflow.conn_plugin import ConnectionAccessPlugin

db_blueprint = Blueprint(
    "db",  # Blueprint name
    __name__,
    url_prefix="/xcodeflow/api/db",
)

CORS(db_blueprint)


@db_blueprint.route("/connections", methods=["GET"])
@csrf.exempt
def get_connections():
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
    """Fetch schemas and tables from the database, including Hive."""
    conn_type = connection.conn_type.lower()
    host, port, schema = connection.host, connection.port, connection.schema
    username, password = connection.login, connection.password
    schemas, tables = [], {}

    if conn_type == 'hiveserver2':
        # Hive Connection using PyHive
        print(f"Connecting to Hive: {host}:{port}")
        engine = sqlalchemy.create_engine(f"hive://{host}:{port}/{schema}", echo=False)
        try:
            with engine.connect() as conn:
                result = conn.execute("SHOW DATABASES")
                schemas = [row[0] for row in result.fetchall()]
                for schema in schemas:
                    result = conn.execute(f"SHOW TABLES FROM {schema}")
                    tables[schema] = [row[1] for row in result.fetchall()]
        except Exception as e:
            print(f"Error fetching schemas/tables: {e}")
        finally:
            engine.dispose()
    else:
        # Other Databases (PostgreSQL, Trino, etc.)
        conn_url = ""
        if conn_type == 'postgres':
            conn_url = f"postgresql://{username}:{password}@{host}:{port}/{schema}"
        elif conn_type == 'trino':
            conn_url = f"trino://{username}:@{host}:{port}/{schema}?SSL=false"

        print(f"Connecting to: {conn_url}")
        engine = sqlalchemy.create_engine(conn_url, echo=False)

        try:
            with engine.connect() as conn:
                result = conn.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name != 'information_schema'")
                schemas = [row[0] for row in result.fetchall()]
                for schema in schemas:
                    result = conn.execute(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}'")
                    tables[schema] = [row[0] for row in result.fetchall()]
        except Exception as e:
            print(f"Error fetching schemas/tables: {e}")
        finally:
            engine.dispose()

    return schemas, tables


def build_tree(connection_id):
    """Builds the hierarchical database tree structure."""
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
        for table in tables.get(schema, []):
            table_node = {
                "title": table,
                "type": "table",
                "key": f"{conn.conn_id}/{schema}/{table}",
                "isLeaf": True
            }
            schema_node["children"].append(table_node)

        root["children"].append(schema_node)

    return root
