import { Routes, BrowserRouter, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import TrackerTest from "./pages/TrackerTest/TrackerTest";
import BugSwat from "./pages/BugSwat/BugSwat";
import PixiTest from "./pages/PixiTest/PixiTest";
import CloudChase2 from "./pages/CloudChase/CloudChase2";
// import CloudChase from "./pages/CloudChase/CloudChase";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tracker-test" element={<TrackerTest />} />
          <Route path="/bug-swat" element={<BugSwat />} />
          <Route path="/pixi-test" element={<PixiTest />} />
          {/* <Route path="/cloud-chase" element={<CloudChase />} /> */}
          <Route path="/cloud-chase" element={<CloudChase2 />} />
          <Route path="*" element={<HomePage /> /* <NotFound /> */} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
