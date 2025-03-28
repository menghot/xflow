const SVC_TYPE_PYTHON = 'PYTHON',
    SVC_TYPE_SPARK = 'SPARK',
    SVC_TYPE_SQL = 'SQL';

export default class CustomPalette {
    constructor(bpmnFactory, create, elementFactory, palette, translate) {
        this.bpmnFactory = bpmnFactory;
        this.create = create;
        this.elementFactory = elementFactory;
        this.translate = translate;
        palette.registerProvider(this);
    }

    getPaletteEntries(element) {
        const {
            bpmnFactory,
            create,
            elementFactory,
            translate
        } = this;

        function createTask(serviceType) {
            return function (event) {
                const businessObject = bpmnFactory.create('bpmn:Task');

                businessObject.serviceType = serviceType;

                const shape = elementFactory.createShape({
                    type: 'bpmn:Task',
                    businessObject: businessObject
                });

                create.start(event, shape);
            };
        }

        return {
            'create.low-task': {
                group: 'activity',
                className: 'bpmn-icon-task red',
                title: translate('Create Task with low suitability score'),
                action: {
                    dragstart: createTask(SVC_TYPE_SQL),
                    click: createTask(SVC_TYPE_SQL)
                }
            },
            'create.average-task': {
                group: 'activity',
                className: 'bpmn-icon-task yellow',
                title: translate('Create Task with average suitability score'),
                action: {
                    dragstart: createTask(SVC_TYPE_SPARK),
                    click: createTask(SVC_TYPE_SPARK)
                }
            },
            'create.high-task': {
                group: 'activity',
                className: 'bpmn-icon-task green',
                title: translate('Create Task with high suitability score'),
                action: {
                    dragstart: createTask(SVC_TYPE_PYTHON),
                    click: createTask(SVC_TYPE_PYTHON)
                }
            }
        };
    }
}

CustomPalette.$inject = [
    'bpmnFactory',
    'create',
    'elementFactory',
    'palette',
    'translate'
];