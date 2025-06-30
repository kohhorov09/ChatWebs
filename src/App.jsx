import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import VideoChat from "./components/Chat/VideoChat";

function App() {
  return (
    <div className="App">
      {/* <Navbar /> */}
      <Routes>
        <Route element={<Navbar />} path="/" />
        <Route element={<VideoChat />} path="videochat" />
      </Routes>
    </div>
  );
}

export default App;
