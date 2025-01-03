// src/App.tsx
import React from "react";
import BpmnEditor from "./components/BpmnEditor.tsx";
import XcodeFlow from "./components/icons/Xcodeflow.tsx";

const App: React.FC = () => {
  return (
    <div>
      <div style={{padding: '0 0 0 20px'}}>
          <XcodeFlow/>
      </div>
      <BpmnEditor />
    </div>
  );
};

export default App;
