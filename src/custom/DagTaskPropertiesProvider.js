// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.

import {is} from 'bpmn-js/lib/util/ModelUtil';
import sqlTaskProps from "./parts/SqlTaskProps";
// import sparkTaskProps from "./parts/SparkTaskProps";
// import pythonTaskProps from "./parts/PythonTaskProps";

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function DagTaskPropertiesProvider(propertiesPanel, translate) {

    // API ////////

    /**
     * Return the groups provided for the given element.
     *
     * @param {DiagramElement} element
     *
     * @return {(Object[]) => (Object[])} groups middleware
     */
    this.getGroups = function (element) {

        /**
         * We return a middleware that modifies
         * the existing groups.
         *
         * @param {Object[]} groups
         *
         * @return {Object[]} modified groups
         */
        return function (groups) {
            // Add the "magic" group
            if (is(element, 'bpmn:Task')) {
                groups.push(createDagGroup(element, translate));
            }
            return groups;
        };
    };


    // registration ////////

    // Register our custom magic properties provider.
    // Use a lower priority to ensure it is loaded after
    // the basic BPMN properties.
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
}


// Create the custom dag group
function createDagGroup(element, translate) {

    console.log('-----------createDagGroup----------------', element)
    const serviceType = element.businessObject.serviceType
    if (serviceType === 'SPARK') {


    } else if (serviceType === 'PYTHON') {


    }

    // create a group called "SQL task properties".
    return {
        id: 'magic',
        label: translate('SQL Task Configuration'),
        entries: sqlTaskProps(element),
        //tooltip: translate('Make sure you know what you are doing!')
    };
}

DagTaskPropertiesProvider.$inject = ['propertiesPanel', 'translate'];
