import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import {append as svgAppend, attr as svgAttr, classes as svgClasses, create as svgCreate} from 'tiny-svg';
import {getRoundRectPath} from 'bpmn-js/lib/draw/BpmnRenderUtil';
import {is} from 'bpmn-js/lib/util/ModelUtil';

import {isNil} from 'min-dash';

const HIGH_PRIORITY = 1500,
    TASK_BORDER_RADIUS = 2,
    COLOR_GREEN = '#52B415',
    COLOR_YELLOW = '#ffc800',
    COLOR_RED = '#cc0000';


export default class CustomRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);

        this.bpmnRenderer = bpmnRenderer;
    }

    canRender(element) {
        const serviceType = element.businessObject.serviceType
        return element.type === 'bpmn:Task' && !isNil(serviceType);
    }

    drawShape(parentNode, element) {

        // FIXME: use bpmn task draw shape
        // element.type = 'bpmn:Task'
        const shape = this.bpmnRenderer.drawShape(parentNode, element);

        // revert to magic:SqlTask
        // element.type = 'magic:SqlTask'

        const serviceType = element.businessObject.serviceType
        if (!isNil(serviceType)) {
            const color = this.getColor(serviceType);

            const rect = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, color);

            svgAttr(rect, {
                transform: 'translate(-20, -10)'
            });

            const text = svgCreate('text');
            svgAttr(text, {
                fill: '#fff',
                transform: 'translate(-15, 5)'
            });

            svgClasses(text).add('djs-label');
            svgAppend(text, document.createTextNode(serviceType));
            svgAppend(parentNode, text);
        }

        return shape;
    }

    getShapePath(shape) {
        if (is(shape, 'bpmn:Task')) {
            return getRoundRectPath(shape, TASK_BORDER_RADIUS);
        }

        return this.bpmnRenderer.getShapePath(shape);
    }

    // getserviceType(element) {
    //     const businessObject = getBusinessObject(element);
    //
    //     const {serviceType} = businessObject;
    //
    //     return Number.isFinite(serviceType) ? serviceType : null;
    // }

    getColor(serviceType) {
        if (serviceType === 'SQL') {
            return COLOR_GREEN;
        } else if (serviceType === 'SPARK') {
            return COLOR_YELLOW;
        } else {
            return COLOR_RED;
        }
    }
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer'];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, color) {
    const rect = svgCreate('rect');

    svgAttr(rect, {
        width: width,
        height: height,
        rx: borderRadius,
        ry: borderRadius,
        stroke: color,
        strokeWidth: 2,
        fill: color
    });

    svgAppend(parentNode, rect);

    return rect;
}