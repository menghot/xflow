import CustomReplaceMenuProvider from "./CustomizeReplaceMenuProvider";
import DagTaskPropertiesProvider from "./DagTaskPropertiesProvider";

import CustomContextPad from './CustomContextPad';
import CustomPalette from './CustomPalette';
import CustomRenderer from './CustomRenderer';

export default {
    __init__: ['customContextPad', 'customPalette', 'customRenderer', 'customReplaceMenuProvider', 'dagTaskPropertiesProvider'],
    customContextPad: ['type', CustomContextPad],
    customPalette: ['type', CustomPalette],
    customRenderer: ['type', CustomRenderer],
    customReplaceMenuProvider: ['type', CustomReplaceMenuProvider],
    dagTaskPropertiesProvider: ['type', DagTaskPropertiesProvider],
};
