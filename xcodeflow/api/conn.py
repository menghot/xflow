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

sql_get_schemas = "SELECT schema_name FROM information_schema.schemata WHERE schema_name != 'information_schema'"


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


def get_connection_engine(connection):
    """Creates a SQLAlchemy engine based on the connection type."""
    conn_type = connection.conn_type.lower()
    host, port = connection.host, connection.port
    username, password = connection.login, connection.password

    if conn_type in ["trino"]:
        return sqlalchemy.create_engine(f"{conn_type}://{username}:@{host}:{port}/", echo=False)
    if conn_type in ["hiveserver2"]:
        return sqlalchemy.create_engine(f"hive://{host}:{port}/", echo=False)
    if conn_type == "postgres":
        return sqlalchemy.create_engine(f"postgresql://{username}:{password}@{host}:{port}/{connection.schema}",
                                        echo=False)

    raise ValueError(f"Unsupported connection type: {conn_type}")


def fetch_schemas_and_tables(connection):
    """Fetch schemas and tables, handling databases without catalogs."""
    engine = get_connection_engine(connection)
    if engine is None:
        return [], {}

    schemas, tables = [], {}
    try:
        with engine.connect() as conn:
            result = conn.execute(sql_get_schemas)
            schemas = [row[0] for row in result.fetchall()]
            for schema in schemas:
                result = conn.execute(
                    f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}'")
                tables[schema] = [row[0] for row in result.fetchall()]
    except Exception as e:
        print(f"Error fetching schemas/tables: {e}")
    finally:
        engine.dispose()

    return schemas, tables


def fetch_catalogs_schemas_and_tables(connection):
    """Fetch catalogs if supported, otherwise fallback to schemas and tables."""
    engine = get_connection_engine(connection)
    if engine is None:
        return [], {}, {}

    catalogs, schemas, tables = [], {}, {}

    try:
        with engine.connect() as conn:
            try:
                result = conn.execute("SHOW CATALOGS")
                catalogs = [row[0] for row in result.fetchall() if row[0] not in ['system']]
                print('--catalogs----', result)
                for catalog in catalogs:
                    # TODO, skip catalog if exception
                    result = conn.execute(f"SHOW SCHEMAS FROM {catalog}")
                    schemas[catalog] = [row[0] for row in result.fetchall() if row[0] not in ['information_schema']]
                    tables[catalog] = {}
                    for schema in schemas[catalog]:
                        result = conn.execute(f"SHOW TABLES FROM {catalog}.{schema}")
                        idx = 0
                        if connection.conn_type == "hiveserver2":
                            idx = 1
                        tables[catalog][schema] = [row[idx] for row in result.fetchall()]
            except Exception:
                catalogs = []  # Catalogs not supported, fallback to schema-level tree
                schemas, tables = fetch_schemas_and_tables(connection)
    except Exception as e:
        print(f"Error fetching catalogs/schemas/tables: {e}")
    finally:
        engine.dispose()

    return catalogs, schemas, tables


def build_tree(connection_id):
    """Builds a hierarchical database tree structure with catalogs (if supported), schemas, and tables."""
    conn = BaseHook.get_connection(connection_id)
    catalogs, schemas, tables = fetch_catalogs_schemas_and_tables(conn)

    if catalogs:
        return [{
            "title": catalog,
            "type": "catalog",
            "key": f"{conn.conn_id}/{catalog}",
            "children": [
                {
                    "title": schema,
                    "type": "schema",
                    "key": f"{conn.conn_id}/{catalog}/{schema}",
                    "children": [
                        {
                            "title": table,
                            "type": "table",
                            "key": f"{conn.conn_id}/{catalog}/{schema}/{table}",
                            "isLeaf": True
                        } for table in tables[catalog].get(schema, [])
                    ]
                } for schema in schemas.get(catalog, [])
            ]
        } for catalog in catalogs]
    else:
        return [
            {
                "title": schema,
                "type": "schema",
                "key": f"{conn.conn_id}/{schema}",
                "children": [
                    {
                        "title": table,
                        "type": "table",
                        "key": f"{conn.conn_id}/{schema}/{table}",
                        "isLeaf": True
                    } for table in tables.get(schema, [])
                ]
            } for schema in schemas
        ]
