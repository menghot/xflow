import React, {useState} from 'react';
import Monaco from '@monaco-editor/react';

const App: React.FC = () => {
    const [code, setCode] = useState('// Start coding here!');

    const handleEditorChange = (value?: string) => {
        setCode(value || '');
    };

    return (
        <div style={{height: '220px'}}>
            <Monaco
                height="200px"
                width="600px"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                    automaticLayout: true,
                    minimap: {enabled: true},
                }}
            />
        </div>
    );
};

export default App;
