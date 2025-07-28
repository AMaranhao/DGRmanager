import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

import Login from '../pages/Login';
import Agenda from '../pages/Agenda';
import ParteAdversa from '../pages/ParteAdversa';
import Processos from '../pages/Processos';
import Acordos from '../pages/Acordos';
import ColaboradoresDGR from '../pages/ColaboradoresDGR';
import Dashboard from '../pages/Dashboard';
import ControleHonorarios from '../pages/ControleHonorarios';
import GerarDocumentos from '../pages/GerarDocumentos';
import Publicacoes from '../pages/Publicacoes';
import Relatorios from '../pages/Relatorios';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      {/* Rotas protegidas */}
      <Route
        path="/agenda"
        element={
          <PrivateRoute>
            <Layout><Agenda /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/parteadversa"
        element={
          <PrivateRoute>
            <Layout><ParteAdversa /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/processos"
        element={
          <PrivateRoute>
            <Layout><Processos /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/acordos"
        element={
          <PrivateRoute>
            <Layout><Acordos /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/colaboradoresdgr"
        element={
          <PrivateRoute>
            <Layout><ColaboradoresDGR /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/controlehonorarios"
        element={
          <PrivateRoute>
            <Layout><ControleHonorarios /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/gerardocumentos"
        element={
          <PrivateRoute>
            <Layout><GerarDocumentos /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/publicacoes"
        element={
          <PrivateRoute>
            <Layout><Publicacoes /></Layout>
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

      {/* Fallback inteligente */}
      <Route
        path="*"
        element={
          localStorage.getItem('token')
            ? <Navigate to="/agenda" />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}
