// src/App.tsx
import React from "react";
import BpmnEditor from "./components/BpmnEditor.tsx";
import Xcodeflow2 from "./components/icons/Xcodeflow2.tsx";
import { ReactSVG } from 'react-svg'

const App: React.FC = () => {
  return (
    <div>
      <div style={{margin:4}}>
          <Xcodeflow2 size={100}/>
      </div>
        <div>
            <ReactSVG src="./assets/icons/xcodeflow2.svg"/>
        </div>
      <BpmnEditor />
    </div>
  );
};

export default App;
