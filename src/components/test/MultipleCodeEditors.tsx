import React, {useState} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {sql} from '@codemirror/lang-sql';

interface EditorConfig {
    id: number;
    language: 'javascript' | 'sql';
    content: string;
}

const Editors: React.FC = () => {
    const [editors, setEditors] = useState<EditorConfig[]>([
        // {id: 1, language: 'javascript', content: 'console.log("Hello, JavaScript!");'},
        // {id: 2, language: 'sql', content: 'SELECT * FROM users;'},
    ]);

    const handleCodeChange = (id: number, newContent: string) => {
        setEditors((prevEditors) =>
            prevEditors.map((editor) =>
                editor.id === id ? {...editor, content: newContent} : editor
            )
        );
    };

    const addEditor = (language: 'javascript' | 'sql', text: string) => {
        setEditors((prevEditors) => [
            ...prevEditors,
            {id: prevEditors.length + 1, language, content: text},
        ]);
    };

    return (
        <div style={{padding: '20px'}}>
            <h1>Dynamic CodeMirror Editors</h1>
            <button onClick={() => addEditor('javascript', 'console.log("Hello, JavaScript!");')}
                    style={{marginRight: '10px'}}>
                Add JavaScript Editor
            </button>
            <button onClick={() => addEditor('sql', 'show catalogs')}>Add SQL Editor</button>
            <div style={{marginTop: '20px'}}>
                {editors.map((editor) => (
                    <div key={editor.id} style={{marginBottom: '20px'}}>
                        <h2>Editor {editor.id} ({editor.language})</h2>
                        <CodeMirror style={{textAlign: 'left'}}
                                    value={editor.content}
                                    height="200px"
                                    theme="dark"
                                    extensions={[editor.language === 'javascript' ? javascript() : sql()]}
                                    onChange={(value) => handleCodeChange(editor.id, value)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Editors;
