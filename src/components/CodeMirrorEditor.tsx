import React from 'react';
import CodeMirror, {EditorView} from '@uiw/react-codemirror';
import {python} from '@codemirror/lang-python';

function CodeEditor() {
    // The editor text
    const [value, setValue] = React.useState("print(123)");

    //Keep editor reference for further use
    const [editorView, setEditorView] = React.useState<EditorView | null>(null)

    const onChange = React.useCallback((v: string) => {
        setValue(v);
    }, []);

    const displaySelectedText = () => {
        // Get the primary selection
        // console.log(editorView)
        if (editorView) {
            const selection = editorView.state.selection.main;
            const selected = editorView.state.doc.sliceString(selection.from, selection.to);
            console.log(selected)
        }
    }

    return <div style={{height: '260px'}}>
        <CodeMirror style={{ textAlign: 'left' }}  onCreateEditor={setEditorView} value={value} theme="dark" height="200px" onChange={onChange}
                    extensions={[python()]}/>
        <button onClick={displaySelectedText}>Display Selected Text</button>
    </div>;
}

export default CodeEditor;