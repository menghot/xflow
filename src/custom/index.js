import CustomReplaceMenuProvider from "./CustomizeReplaceMenuProvider";
import DagPropertiesProvider from "./DagPropertiesProvider";

export default {
    __init__: ['customReplaceMenuProvider', 'magicPropertiesProvider'],
    customReplaceMenuProvider: ['type', CustomReplaceMenuProvider],
    magicPropertiesProvider: ['type', DagPropertiesProvider],
};
