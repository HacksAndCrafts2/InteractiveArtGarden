import { Routes, BrowserRouter, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import TrackerTest from "./pages/TrackerTest/TrackerTest";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tracker-test" element={<TrackerTest />} />
          <Route path="*" element={<HomePage /> /* <NotFound /> */} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
