
import sys
print(sys.path)

from airflow.plugins_manager import AirflowPlugin
from my_plugin.web_views.my_view import my_blueprint

class MyPlugin(AirflowPlugin):
    name = "my_plugin"
    flask_blueprints = [my_blueprint]



