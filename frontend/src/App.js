
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import { Toaster } from "sonner";
import "@/App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:id" element={<Editor />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" />
    </>
  );
}

export default App;
