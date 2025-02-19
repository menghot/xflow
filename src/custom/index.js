import CustomReplaceMenuProvider from "./CustomizeReplaceMenuProvider";
import DagTaskPropertiesProvider from "./DagTaskPropertiesProvider";

export default {
    __init__: ['customReplaceMenuProvider', 'dagTaskPropertiesProvider'],
    customReplaceMenuProvider: ['type', CustomReplaceMenuProvider],
    dagTaskPropertiesProvider: ['type', DagTaskPropertiesProvider],
};
