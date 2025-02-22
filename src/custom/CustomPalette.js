const SUITABILITY_SCORE_HIGH = 100,
    SUITABILITY_SCORE_AVERAGE = 50,
    SUITABILITY_SCORE_LOW = 25;

export default class CustomPalette {
    constructor(bpmnFactory, create, elementFactory, palette, translate) {
        this.bpmnFactory = bpmnFactory;
        this.create = create;
        this.elementFactory = elementFactory;
        this.translate = translate;
        console.log('before-----', palette);
        palette.registerProvider(this);
        console.log('after-----', palette);
    }

    getPaletteEntries(element) {
        const {
            bpmnFactory,
            create,
            elementFactory,
            translate
        } = this;

        function createTask(suitabilityScore) {
            return function (event) {
                const businessObject = bpmnFactory.create('magic:MyTask');

                businessObject.suitable = suitabilityScore;

                const shape = elementFactory.createShape({
                    type: 'magic:MyTask',
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
                    dragstart: createTask(SUITABILITY_SCORE_LOW),
                    click: createTask(SUITABILITY_SCORE_LOW)
                }
            },
            'create.average-task': {
                group: 'activity',
                className: 'bpmn-icon-task yellow',
                title: translate('Create Task with average suitability score'),
                action: {
                    dragstart: createTask(SUITABILITY_SCORE_AVERAGE),
                    click: createTask(SUITABILITY_SCORE_AVERAGE)
                }
            },
            'create.high-task': {
                group: 'activity',
                className: 'bpmn-icon-task green',
                title: translate('Create Task with high suitability score'),
                action: {
                    dragstart: createTask(SUITABILITY_SCORE_HIGH),
                    click: createTask(SUITABILITY_SCORE_HIGH)
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