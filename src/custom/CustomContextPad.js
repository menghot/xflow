const SVC_TYPE_PYTHON = 'PYTHON',
    SVC_TYPE_SPARK = 'SPARK',
    SVC_TYPE_SQL = 'SQL';

export default class CustomContextPad {
    constructor(bpmnFactory, config, contextPad, create, elementFactory, injector, translate, selection) {
        this.bpmnFactory = bpmnFactory;
        this.create = create;
        this.elementFactory = elementFactory;
        this.translate = translate;
        this.selection = selection

        contextPad._eventBus.on('element.click', 500, (event) => {
            //overwrite the default behavior
            if (contextPad.isOpen()) {
                contextPad.close();
            }
        })

        contextPad._eventBus.on('element.contextmenu', 1500, (event) => {
            event.preventDefault()
            const element = event.element;
            if (contextPad.isOpen()) {
                contextPad.close();
            } else {
                //contextPad.open(element, event.originalEvent || event.event);
                selection.select(element)
            }
        })

        if (config.autoPlace !== false) {
            this.autoPlace = injector.get('autoPlace', false);
        }

        contextPad.registerProvider(this);
    }

    getContextPadEntries(element) {
        const {
            autoPlace,
            bpmnFactory,
            create,
            elementFactory,
            translate
        } = this;

        function appendServiceTask(serviceType) {
            return function (event, element) {
                if (autoPlace) {
                    const businessObject = bpmnFactory.create('bpmn:Task');
                    businessObject.serviceType = serviceType;
                    const shape = elementFactory.createShape({
                        type: 'bpmn:Task',
                        businessObject: businessObject
                    });
                    autoPlace.append(element, shape);
                } else {
                    appendServiceTaskStart(event, element);
                }
            };
        }

        function appendServiceTaskStart(serviceType) {
            return function (event) {
                const businessObject = bpmnFactory.create('bpmn:Task');
                businessObject.serviceType = serviceType;
                const shape = elementFactory.createShape({
                    type: 'bpmn:Task',
                    businessObject: businessObject
                });
                create.start(event, shape, element);
            };
        }

        return {
            'append.low-task': {
                group: 'model',
                className: 'bpmn-icon-task red',
                title: translate('Append Task with Spark Application'),
                action: {
                    click: appendServiceTask(SVC_TYPE_SQL),
                    dragstart: appendServiceTaskStart(SVC_TYPE_SQL)
                }
            },
            'append.average-task': {
                group: 'model',
                className: 'bpmn-icon-task yellow',
                title: translate('Append Spark Task '),
                action: {
                    click: appendServiceTask(SVC_TYPE_SPARK),
                    dragstart: appendServiceTaskStart(SVC_TYPE_SPARK)
                }
            },
            'append.high-task': {
                group: 'model',
                className: 'bpmn-icon-task green',
                title: translate('Append Task Trino SQL task'),
                action: {
                    click: appendServiceTask(SVC_TYPE_PYTHON),
                    dragstart: appendServiceTaskStart(SVC_TYPE_PYTHON)
                }
            }
        };
    }
}

CustomContextPad.$inject = [
    'bpmnFactory',
    'config',
    'contextPad',
    'create',
    'elementFactory',
    'injector',
    'translate',
    'selection'
];