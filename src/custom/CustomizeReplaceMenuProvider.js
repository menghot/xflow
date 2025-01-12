export default class MyReplaceMenuProvider {

    constructor(replaceMenuProvider, popupMenu) {
        this.replaceMenuProvider = replaceMenuProvider;
        this.popupMenu = popupMenu;
        console.log('---replaceMenuProvider---', replaceMenuProvider);

        // Overwrite/Remove the injected provider
        replaceMenuProvider.getEntries = function(target) {
          return [];
        };
        replaceMenuProvider.getPopupMenuEntries = function(target) {
          return [];
        };

        popupMenu.registerProvider('bpmn-replace', 2000, this);
        console.log('---replaceMenuProvider---', replaceMenuProvider);
    }


    getPopupMenuEntries(target) {
        console.log(target, '---MyReplaceMenuProvider----1----');
        return this.replaceMenuProvider._createEntries(target, [
            {
                label: 'Custom Task',
                actionName: 'replace-with-custom-task',
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