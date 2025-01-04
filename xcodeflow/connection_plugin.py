from airflow.models.connection import Connection
from airflow.plugins_manager import AirflowPlugin
from airflow.utils.db import provide_session


class ConnectionAccessPlugin(AirflowPlugin):
    name = "connection_access_plugin"

    @staticmethod
    @provide_session
    def list_connections(session=None):
        """
        Retrieves all Airflow connections from the metadata database.
        """
        connections = session.query(Connection).all()
        return [
            {
                "connection_id": conn.conn_id,
                "conn_type": conn.conn_type,
                "description": conn.description,
                "host": conn.host,
                "login": conn.login,
                "schema": conn.schema,
                "port": conn.port,
                "extra": conn.extra_dejson,
            }
            for conn in connections
        ]
