import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.cargo)) {
    return <Navigate to="/agenda" replace />;
  }

  return children;
};

export default RoleRoute;
