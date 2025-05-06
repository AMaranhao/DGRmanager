// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Emprestimos from '../pages/Emprestimos';
import Relatorios from '../pages/relatorios/GuiasRelatorios';
import Infraestrutura from '../pages/Infraestrutura';
import Login from '../pages/Login';
import Usuarios from '../pages/Usuarios';
import PerfilUsuario from '../pages/PerfilUsuario';
import PrivateRoute from '../routes/PrivateRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/emprestimos"
        element={
          <PrivateRoute>
            <Layout><Emprestimos /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <PrivateRoute>
            <Layout><Relatorios /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <Layout><Usuarios /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/infraestrutura"
        element={
          <PrivateRoute>
            <Layout><Infraestrutura /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Layout><PerfilUsuario /></Layout>
          </PrivateRoute>
        }
      />

      {/* fallback: redireciona qualquer rota inválida para login */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
