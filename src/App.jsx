import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Landing/Home";
import Signup from "./Guards/Signup";
import Login from "./Guards/Login";
import Squad from "./Landing/Squad";
import Dashboard from "./Components/Dashboard";
import Gallery from "./Landing/Gallery";
import Event from "./Landing/Event";
import AdminDashboard from "./Admin/AdminDashboard";
import { PlayerProvider } from "./context/PlayerContext";
import ForgotPassword from "./Guards/ForgotPassword";
import Rules from "./Landing/Rules";

function App() {
  const isLoggedIn = !!localStorage.getItem("player");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/squad" element={<Squad />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/rules" element={<Rules />} />
        <Route
          path="/dashboard"
          element={
            <PlayerProvider>
              <Dashboard />
            </PlayerProvider>
          }
        />
        <Route path="/Event" element={<Event />} />
        <Route
          path="/admin"
          element={
            <PlayerProvider>
              <AdminDashboard />
            </PlayerProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
