import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import AppShell from "../components/layout/AppShell";
import ProtectedRoute from "../auth/ProtectedRoute";
import Users from "../pages/Users/Users";
import EditUser from "../pages/Users/EditUser";
import Roles from "../pages/Roles/Roles";
import Audit from "../pages/Audit/Audit";
import Profile from "../pages/Profile/Profile";
import NotFound from "../pages/Notfound/Notfound";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "users", element: <ProtectedRoute permission="users.view"><Users /></ProtectedRoute> },
      { path: "users/edit/:id", element: <ProtectedRoute permission="users.edit"><EditUser /></ProtectedRoute> },
      { path: "roles", element: <ProtectedRoute permission="roles.view"><Roles /></ProtectedRoute> },
      { path: "audit", element: <ProtectedRoute permission="audit.view"><Audit /></ProtectedRoute> },
      { path: "profile", element: <Profile /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;