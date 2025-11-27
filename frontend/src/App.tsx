import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Home } from "./components/Home";
import { CodeEditor } from "./components/Editor";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<CodeEditor />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
