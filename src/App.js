import { Routes, BrowserRouter, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import TrackerTest from "./pages/TrackerTest/TrackerTest";
import BugSwat from "./pages/BugSwat/BugSwat";
import PixiTest from "./pages/PixiTest/PixiTest";
import "./App.css";
import GenerativeTest from "./pages/GenerativeTest/GenerativeTest";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tracker-test" element={<TrackerTest />} />
          <Route path="/bug-swat" element={<BugSwat />} />
          <Route path="/pixi-test" element={<PixiTest />} />
          <Route path="/generate-test" element={<GenerativeTest />} />
          <Route path="*" element={<HomePage /> /* <NotFound /> */} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
