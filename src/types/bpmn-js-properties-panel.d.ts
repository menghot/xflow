// support typescript
declare module 'bpmn-js-properties-panel' {
    import { Module } from 'didi';

    // Define the types for the BpmnPropertiesPanelModule
    const BpmnPropertiesPanelModule: Module;
    export { BpmnPropertiesPanelModule };

    // Define the types for a generic BpmnPropertiesProviderModule
    const BpmnPropertiesProviderModule: Module;
    export { BpmnPropertiesProviderModule };

    export default BpmnPropertiesPanelModule;
}
