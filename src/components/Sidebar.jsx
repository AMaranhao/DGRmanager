import { Link } from "react-router-dom";
import { KeyRound, ClipboardList, BookText, Building2, Users, CalendarDays, } from "lucide-react";

import '@/styles/darkmode-styles.css';
import '@/styles/components.css';
import '@/styles/mobile.css';
import '@/styles/pages/buttons.css';

export default function Sidebar() {
  return (
    <aside className="sidebar noprint">
      {/* Logo */}
      <Link to="/dashboard" className="sidebar-logo-container">
        <img src="/logo.png" alt="Logo" className="sidebar-logo" />
      </Link>

      {/* Ícones */}
      <div className="sidebar-icons">
        <Link to="/agendamentos" title="Agendamentos">
          <CalendarDays size={28} className="sidebar-icon" />
        </Link>
        <Link to="/dashboard" title="Chaves">
          <KeyRound size={28} className="sidebar-icon" />
        </Link>
        <Link to="/emprestimos" title="Empréstimos">
          <ClipboardList size={28} className="sidebar-icon" />
        </Link>
        <Link to="/usuarios" title="Usuários">
          <Users size={28} className="sidebar-icon" />
        </Link>
        <Link to="/infraestrutura" title="Instalações">
          <Building2 size={28} className="sidebar-icon" />
        </Link>
        <Link to="/relatorios" title="Relatórios">
          <BookText size={28} className="sidebar-icon" />
        </Link>
      </div>
    </aside>
  );
}
