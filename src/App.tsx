// src/App.tsx
import React from "react";
import BpmnEditorComponent from "./components/BpmnModel.tsx";

const App: React.FC = () => {
  return (
    <div>
      <h1>Workflow Pipeline</h1>
      <BpmnEditorComponent />
    </div>
  );
};

export default App;
