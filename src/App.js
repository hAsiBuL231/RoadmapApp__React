import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoadMap from "./pages/roadmap/Roadmap";
import ProtectedRoute from "./components/ProtectedRoute";


// npm install react-router-dom react-icons chart.js react-chartjs-2 axios
// npm start

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/roadmap" element={<ProtectedRoute><RoadMap /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;