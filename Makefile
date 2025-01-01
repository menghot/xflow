SHELL=/bin/bash -e

help:
	@echo "- make dev-image    Build dev image"
	@echo "- make dev-shell    Start a shell in the dev environment"
	@echo "- make standalone   Run an all-in-one copy of Airflow"
	@echo "- make webserver    Start a Airflow webserver instance"
	@echo "- make scheduler    Start a scheduler instance"


webserver:
	-airflow webserver

scheduler:
	-airflow scheduler

clean:
	-rm -rf build dist
	-rm -rf *.egg-info

npm-build:
	@npm run build

npm-watch:
	@npm run watch
