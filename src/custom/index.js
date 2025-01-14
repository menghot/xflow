import CustomReplaceMenuProvider from "./CustomizeReplaceMenuProvider";
import MagicPropertiesProvider from "./MagicPropertiesProvider";

export default {
    __init__: ['customReplaceMenuProvider', 'magicPropertiesProvider'],
    customReplaceMenuProvider: ['type', CustomReplaceMenuProvider],
    magicPropertiesProvider: ['type', MagicPropertiesProvider],
};
