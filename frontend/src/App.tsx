import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './pages/StudentDashboard'; // Renamed
import { FacultyDashboard } from './pages/FacultyDashboard'; // New
import { SupportDashboard } from './pages/SupportDashboard';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { ContactSupport } from './pages/ContactSupport';
import { FacultyProfile } from './pages/FacultyProfile';
import { HODDashboard } from './pages/HODDashboard';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 font-sans">
      {/* Hide Navbar on Login, Landing, and Contact Support for cleaner look */}
      {path !== '/login' && path !== '/' && path !== '/contact-support' && <Navbar />}
      <main className={`${path !== '/' ? 'container mx-auto px-4 py-8 max-w-7xl' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/support" element={<SupportDashboard />} />
          <Route path="/contact-support" element={<ContactSupport />} />
          <Route path="/faculty/profile" element={<FacultyProfile />} />
          <Route path="/hod" element={<HODDashboard />} />
        </Routes>
      </main>
    </div>
  );
}


export default App;
