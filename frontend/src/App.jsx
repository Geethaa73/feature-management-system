import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Environments from "./pages/Environments";
import Groups from "./pages/Groups";
import UserGroups from "./pages/UserGroups";
import TargetingRules from "./pages/TargetingRules";
import Overrides from "./pages/Overrides";
import AuditLogs from "./pages/AuditLogs";
import Users from "./pages/Users";
import Evaluate from "./pages/Evaluate";
import Analysis from "./pages/Analysis";
import SDK from "./pages/SDK";
import Profile from "./pages/Profile";

import MainLayout from "./layouts/MainLayout";
import PWAInstall from "./components/PWAInstall";

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            token
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/features"
            element={<Features />}
          />

          <Route
            path="/environments"
            element={<Environments />}
          />

          <Route
            path="/groups"
            element={<Groups />}
          />

          <Route
            path="/user-groups"
            element={<UserGroups />}
          />

          <Route
            path="/targeting-rules"
            element={<TargetingRules />}
          />

          <Route
            path="/overrides"
            element={<Overrides />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
            path="/audit-logs"
            element={<AuditLogs />}
          />

          <Route
            path="/evaluate"
            element={<Evaluate />}
          />

          <Route
            path="/analysis"
            element={<Analysis />}
          />

          <Route
            path="/sdk"
            element={<SDK />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      <PWAInstall />
    </>
  );
}

export default App;