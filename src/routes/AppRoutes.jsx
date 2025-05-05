// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Emprestimos from '../pages/Emprestimos';
import Relatorios from '../pages/relatorios/GuiasRelatorios';
import Infraestrutura from '../pages/Infraestrutura';
import Login from '../pages/Login';
import Usuarios from "../pages/Usuarios"; 

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/emprestimos" element={<Layout><Emprestimos /></Layout>} />
      <Route path="/relatorios" element={<Layout><Relatorios /></Layout>} />
      <Route path="/usuarios" element={<Layout><Usuarios/></Layout>} />
      <Route path="/infraestrutura" element={<Layout><Infraestrutura /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Layout><Login /></Layout>} />
    </Routes>
  );
}
