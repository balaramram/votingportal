import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VotingPage from "./pages/VotingPage.jsx"
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashBoard from "./pages/AdminDashBoard.jsx";
import ResultPage from "./pages/ResultPage.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(!!localStorage.getItem("adminToken"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Home Path: User login panni irundha Voting Page, illana Login-ke anuppuvom */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/voteing-page" /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/voteing-page" /> : <Register />} 
        />

        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/voteing-page" /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
        />

        {/* Protected Routes: isAuthenticated-ai prop-ah anuppuvom */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/voteing-page" element={<VotingPage />} />
          <Route path="/result-page/:pollId" element={<ResultPage />}/>
        </Route>

        <Route path="/admin-login" element={<AdminLogin setIsAdminAuthenticated={setIsAdminAuthenticated}/>} />
        <Route path="/admin-dashboard" element={isAdminAuthenticated ? <AdminDashBoard /> : <Navigate to ="/admin-login" />}/>
        
        <Route path="*" element={<div className="flex flex-col justify-center items-center min-h-screen"><p className="text-6xl font-bold">404</p><p className="font-bold text-4xl">Page Not Found</p></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;