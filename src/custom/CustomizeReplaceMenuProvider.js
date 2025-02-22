export default class MyReplaceMenuProvider {

    constructor(replaceMenuProvider, popupMenu) {
        this.replaceMenuProvider = replaceMenuProvider;
        this.popupMenu = popupMenu;
        // Overwrite/Remove the injected provider
        // remove all default tasks, User task,  Received Task, Manual Task ....
        // replaceMenuProvider.getEntries = function(target) {
        //  return [];
        // };
        // replaceMenuProvider.getPopupMenuEntries = function(target) {
        //  return [];
        // };
        popupMenu.registerProvider('bpmn-replace', 2000, this);
    }


    getPopupMenuEntries(target) {
        return this.replaceMenuProvider._createEntries(target, [
            {
                label: 'SQL Task',
                actionName: 'replace-with-sql-task',
                className: 'bpmn-icon-sql-task',
                target: {
                    type: 'magic:MyTask',
                },
            }, {
                label: 'Spark Task',
                actionName: 'replace-with-spark-task',
                className: 'bpmn-icon-spark-task',
                target: {
                    type: 'bpmn:ServiceTask',
                },
            }, {
                label: 'Java Task',
                actionName: 'replace-with-java-task',
                className: 'bpmn-icon-java-task',
                target: {
                    type: 'bpmn:Task',
                },
            }, {
                label: 'HTTP Call',
                actionName: 'replace-with-http-task',
                className: 'bpmn-icon-custom-task',
                target: {
                    type: 'bpmn:Task',
                },
            }, {
                label: 'Bash Script',
                actionName: 'replace-with-bash-task',
                className: 'bpmn-icon-script-task',
                target: {
                    type: 'bpmn:ScriptTask',
                },
            }, {
                label: 'Python',
                actionName: 'replace-with-python-task',
                className: 'bpmn-icon-service-task',
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