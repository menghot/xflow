// src/App.tsx
import React from "react";
import BpmnEditorComponent from "./components/BpmnModel.tsx";

const App: React.FC = () => {
  return (
    <div>
      <h5>DAG Tools</h5>
      <BpmnEditorComponent />
    </div>
  );
};

export default App;
