// src/App.tsx
import React from "react";
import BpmnEditor from "./components/BpmnEditor.tsx";

const App: React.FC = () => {
  return (
    <div>
      <h5>DAG Tools</h5>
      <BpmnEditor />
    </div>
  );
};

export default App;
