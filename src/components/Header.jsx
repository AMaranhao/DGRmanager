// src/components/Header.jsx
import { User, Settings } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import '@/styles/components.css';
import '@/styles/pages/buttons.css';

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate(); // 👈 necessário para navegação


  return (
    <header className="header">
      {/* Espaço à esquerda da logo (vazio para equilibrar) */}
      <div className="header-spacer" />

      {/* Centro com o título */}
      <div className="header-center">
        <h1 className="header-title">
          <span className="block">Hospital das Clínicas</span>
        </h1>
      </div>

      {/* Ações à direita */}
      <div className="header-actions noprint">
        <button
          className="header-icon-button"
          onClick={() => navigate('/perfil')}
          title="Perfil do Usuário">
          <User className="icon" />
        </button>
        <Settings className="icon" />
        <button className="logout-button" onClick={logout}>SAIR</button>
      </div>
    </header>
  );
}
