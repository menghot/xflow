export default class MyReplaceMenuProvider {

    constructor(replaceMenuProvider, popupMenu) {
        this.replaceMenuProvider = replaceMenuProvider;
        this.popupMenu = popupMenu;
        // Overwrite/Remove the injected provider
        replaceMenuProvider.getEntries = function(target) {
          return [];
        };
        replaceMenuProvider.getPopupMenuEntries = function(target) {
          return [];
        };
        popupMenu.registerProvider('bpmn-replace', 2000, this);
    }


    getPopupMenuEntries(target) {
        return this.replaceMenuProvider._createEntries(target, [
            {
                label: 'Python',
                actionName: 'replace-with-python-task',
                className: 'bpmn-icon-service-task',
                target: {
                    type: 'bpmn:ServiceTask',
                },
            },{
                label: 'SQL Task',
                actionName: 'replace-with-sql-task',
                className: 'bpmn-icon-custom-task',
                target: {
                    type: 'bpmn:ServiceTask',
                },
            },{
                label: 'HTTP Call',
                actionName: 'replace-with-http-task',
                className: 'bpmn-icon-custom-task',
                target: {
                    type: 'bpmn:ServiceTask',
                },
            },{
                label: 'Bash Script',
                actionName: 'replace-with-http-task',
                className: 'bpmn-icon-script-task',
                target: {
                    type: 'bpmn:ServiceTask',
                },
            },{
                label: 'Java Application (SpringBoot)',
                actionName: 'replace-with-java-task',
                className: 'bpmn-icon-custom-task',
                target: {
                    type: 'bpmn:ServiceTask',
                },
            },
        ]);
    }
}

MyReplaceMenuProvider.$inject = [
    'replaceMenuProvider',
    'popupMenu'
];