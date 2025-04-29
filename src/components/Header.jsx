// src/components/Header.jsx
import { HelpCircle, User, Settings } from "lucide-react";

export default function Header() {
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
      <div className="header-actions">
        <HelpCircle className="icon" />
        <User className="icon" />
        <Settings className="icon" />
        <button className="logout-button">SAIR</button>
      </div>
    </header>
  );
}
