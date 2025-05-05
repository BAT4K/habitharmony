import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomeScreen from "./pages/HomeScreen";
import Intro from "./pages/Intro";
import Auth from "./pages/Auth";
import CalendarPage from "./pages/CalendarPage";
import BadgePage from "./pages/BadgePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";

const AppContent = () => {
  const location = useLocation();

  const showNavbar = ["/homescreen", "/calendar", "/profile"].includes(
    location.pathname
  );

  return (
    <div>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/homescreen" element={<HomeScreen />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/earning" element={<BadgePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

      {showNavbar && <Navbar />}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
