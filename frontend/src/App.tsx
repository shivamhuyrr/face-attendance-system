import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './pages/StudentDashboard'; // Renamed
import { FacultyDashboard } from './pages/FacultyDashboard'; // New
import { SupportDashboard } from './pages/SupportDashboard';
import { Login } from './pages/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/support" element={<SupportDashboard />} />
            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
