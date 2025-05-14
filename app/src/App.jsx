import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

// Lazy load route components
const Login = lazy(() => import('./components/Login'));
const ModernSignup = lazy(() => import('./components/ModernSignup'));
const HomeScreen = lazy(() => import('./pages/HomeScreen'));
const Intro = lazy(() => import('./pages/Intro'));
const Auth = lazy(() => import('./pages/Auth'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const BadgePage = lazy(() => import('./pages/BadgePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const FriendsScreen = lazy(() => import('./pages/FriendsScreen'));

const AppContent = () => {
  const location = useLocation();

  // Update the array to exclude assistant page from showing navbar
  const showNavbar = ["/homescreen", "/calendar", "/profile", "/friends"].includes(
    location.pathname
  );

  // Global status bar and nav bar color effect
  useEffect(() => {
    // Only run on native
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        // Default: white for all pages
        let statusBarColor = '#FFFFFF';
        let navBarColor = '#FFFFFF';
        let themeColor = '#FFFFFF';
        let style = Style.Dark;
        // Intro page: special colors
        if (location.pathname === '/' || location.pathname === '/auth') {
          statusBarColor = '#FDEAC6';
          navBarColor = '#F7B23D';
          themeColor = '#FDEAC6';
        } else if (location.pathname === '/homescreen') {
          statusBarColor = '#F8F3F3';
          navBarColor = '#FFFFFF';
          themeColor = '#F8F3F3';
        }
        StatusBar.setBackgroundColor({ color: statusBarColor });
        StatusBar.setStyle({ style });
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setNavigationBarColor({ color: navBarColor });
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
      });
    }
  }, [location.pathname]);

  return (
    <>
      <div style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <Suspense fallback={<div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>}>
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
        </Suspense>
        {showNavbar && <Navbar />}
      </div>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;