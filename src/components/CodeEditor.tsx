import React, {useState} from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

/////////////////////// Enable download js library fom local instead of CDN begin
import { loader } from '@monaco-editor/react';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });
loader.init().then(/* ... */);
////////////////////////////////////////////////// FIX CDN issue end

const App: React.FC = () => {
    const [code, setCode] = useState('// Start coding here!');
    const [editor, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(null); // State to store Monaco editor instance

    const handleEditorChange = (value?: string) => {
        console.log("editor text changed, " + value)
        setCode(value || '');
    };


    const editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        setEditorInstance(editor); // Save the Monaco editor instance once it's mounted
        editor.onDidChangeCursorSelection((event) => {
            console.log('Selection changed:', event);
        });
    };

    const handleButtonClick = () => {

        if (editor) {
            const selection = editor.getSelection(); // Get the current selection
            if (selection) {
                const selectedText = editor.getModel()?.getValueInRange(selection); // Get the selected text in the editor
                if (selectedText != "") {
                    console.log("2" + selectedText)
                } else {
                    console.log("3" + code);
                }
            }
        }
    };

    return (
        <div style={{height: '260px'}}>
            <Editor
                height="200px"
                width="600px"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                onMount={editorDidMount}
                options={{
                    automaticLayout: true,
                    minimap: {enabled: true},
                }}
            />

            <button onClick={handleButtonClick}>Display Editor Value</button>

        </div>
    );
};

export default App;
