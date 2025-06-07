import React from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import AddRecipePage from "./components/AddRecipePage";
import CustomerViewPage from "./components/CustomerViewPage";
import SellerViewPage from "./components/SellerViewPage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [status, setStatus] = React.useState({ loading: true });

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/auth/status", {
          credentials: "include",
        });
        const data = await response.json();

        if (!data.authenticated) {
          setStatus({ loading: false, authorized: false });
          return;
        }

        const role = data.user.role;

        const hasAccess = allowedRoles.includes(role);
        setStatus({ loading: false, authorized: hasAccess });
      } catch {
        setStatus({ loading: false, authorized: false });
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (status.loading) return <div>Loading...</div>;
  return status.authorized ? children : <Navigate to="/" replace />;
};


const App=()=> {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route 
          path="/add" element={
            <ProtectedRoute allowedRoles={["seller"]}> 
              <AddRecipePage/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cusview" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerViewPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/selview" element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerViewPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;