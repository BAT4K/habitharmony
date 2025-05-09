import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from './components/Login';  // Update this import path
import ModernSignup from './components/ModernSignup';
import HomeScreen from "./pages/HomeScreen";
import Intro from "./pages/Intro";
import Auth from "./pages/Auth";
import CalendarPage from "./pages/CalendarPage";
import BadgePage from "./pages/BadgePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AssistantPage from "./pages/AssistantPage"; // Add this import
import Navbar from "./components/Navbar";
import FriendsScreen from "./pages/FriendsScreen";

const AppContent = () => {
  const location = useLocation();

  // Update the array to exclude assistant page from showing navbar
  const showNavbar = ["/homescreen", "/calendar", "/profile", "/friends"].includes(
    location.pathname
  );

  return (
    <div>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<ModernSignup />} />
        <Route path="/homescreen" element={<HomeScreen />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/earning" element={<BadgePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/friends" element={<FriendsScreen />} />
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