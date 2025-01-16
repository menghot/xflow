import CustomReplaceMenuProvider from "./CustomizeReplaceMenuProvider";
import DagPropertiesProvider from "./DagPropertiesProvider";

export default {
    __init__: ['customReplaceMenuProvider', 'dagPropertiesProvider'],
    customReplaceMenuProvider: ['type', CustomReplaceMenuProvider],
    dagPropertiesProvider: ['type', DagPropertiesProvider],
};
