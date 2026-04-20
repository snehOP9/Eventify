import { Navigate, useLocation } from "react-router-dom";
import {
  getCurrentAuthIdentity,
  normalizeAuthRole,
  resolveDashboardPath
} from "../../services/authService";

const RoleProtectedRoute = ({ children, allowedRoles = [], loginPath = "/login" }) => {
  const location = useLocation();
  const authIdentity = getCurrentAuthIdentity();
  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  if (!authIdentity.isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: fullPath }} />;
  }

  if (!allowedRoles.length) {
    return children;
  }

  const normalizedRole = normalizeAuthRole(authIdentity.role);
  const allowedRoleSet = new Set(allowedRoles.map((role) => normalizeAuthRole(role)));

  if (!allowedRoleSet.has(normalizedRole)) {
    return <Navigate to={resolveDashboardPath(authIdentity.role)} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
