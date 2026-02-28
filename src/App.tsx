import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import AttractionsPage from './components/AttractionsPage';
import AttractionDetails from './components/AttractionDetails';
import Login from './components/Login';
import Register from './components/Register';
import ActivateAccount from './components/ActivateAccount';
import UserProfile from './components/UserProfile';
import OnboardingPage from './components/OnboardingPage';
import Navbar from './components/Navbar';
import SafariPage from './components/safari/SafariPage';
import MapPage from './components/MapPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Safari is the main interface — default homepage */}
          <Route path="/" element={<SafariPage />} />
          <Route path="/safari" element={<Navigate to="/" replace />} />

          {/* Map page */}
          <Route path="/map" element={<MapPage />} />

          {/* Existing pages — all preserved */}
          <Route path="/home" element={<Home />} />
          <Route path="/attractions" element={<AttractionsPage />} />
          <Route path="/attraction/:id" element={<AttractionDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activate-account" element={<ActivateAccount />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;