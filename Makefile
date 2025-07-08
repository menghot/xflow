SHELL=/bin/bash -e

help:
	@echo "- make standalone   Run an all-in-one copy of Airflow"
	@echo "- make webserver    Start a Airflow webserver instance"
	@echo "- make scheduler    Start a scheduler instance"


webserver:
	-@airflow webserver

scheduler:
	-@airflow scheduler

clean:
	-rm -rf build dist
	-rm -rf *.egg-info

npm-build:
	@npm run build

npm-watch:
	@npm run watch

docker0:
	-@npm run build
	-rm -rf docker/xcodeflow
	-cp -r xcodeflow docker/
	-rm -rf docker/xcodeflow/test
	-mv dist docker/xcodeflow/static
	-cd docker && docker build -t xflow .

