import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import DayGuide from './DayGuide';
import Login from './Login';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  return currentUser ? <DayGuide /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
